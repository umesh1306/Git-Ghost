import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { Octokit } from "octokit";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { repoUrl, githubToken } = req.body;

      if (!repoUrl) {
        return res.status(400).json({ error: "Repository URL is required" });
      }

      // Parse repo URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        return res.status(400).json({ error: "Invalid GitHub repository URL" });
      }
      const owner = match[1];
      const repo = match[2].replace('.git', '');

      const octokit = new Octokit({ auth: githubToken });

      // Fetch recent commits
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 5, // Analyze last 5 commits for ghosts
      });

      let allDeletedCode = "";

      // Fetch diffs for these commits
      for (const commit of commits) {
        const { data: commitData } = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });

        if (commitData.files) {
          for (const file of commitData.files) {
            if (file.patch) {
              // Extract deleted lines (starting with - but not ---)
              const deletedLines = file.patch
                .split('\n')
                .filter(line => line.startsWith('-') && !line.startsWith('---'))
                .map(line => line.substring(1).trim())
                .filter(line => line.length > 0);
              
              if (deletedLines.length > 0) {
                allDeletedCode += `\nFile: ${file.filename}\nCommit: ${commit.sha}\nDeleted:\n${deletedLines.join('\n')}\n`;
              }
            }
          }
        }
      }

      if (!allDeletedCode.trim()) {
        return res.json({ 
          status: "no_ghosts", 
          message: "No significant deleted code found in recent commits." 
        });
      }

      console.log("Found deleted code, calling Gemini...");

      // Initialize Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in the AI Studio Secrets panel." });
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are GitGhost, a forensic AI tool that reconstructs deleted logic from Git history.
Analyze the following deleted code snippets from a repository.
Identify the purpose of the deleted code, the likely reason it was deleted, and any potential risks or vulnerabilities introduced by its deletion (e.g., removed safeguards, missing validations).

Deleted Code:
${allDeletedCode.substring(0, 10000)} // Limit to avoid token overflow

Provide the analysis in JSON format matching this schema:
{
  "purpose": "String describing what the code did",
  "reason_deleted": "String describing why it was likely removed",
  "risk": "String describing the risk of removing it (e.g., 'Potential null pointer vulnerability', 'None')"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const analysisText = response.text;
      if (!analysisText) {
        throw new Error("Failed to generate analysis");
      }

      const analysis = JSON.parse(analysisText);

      res.json({
        status: "success",
        repo: `${owner}/${repo}`,
        deleted_code: allDeletedCode.substring(0, 1000), // Return a snippet
        analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Analysis error:", error);
      
      let errorMessage = error.message || "An error occurred during analysis";
      
      // Try to parse Gemini API errors
      if (errorMessage.includes("API key not valid")) {
        errorMessage = "Invalid Gemini API key. Please check your Secrets panel.";
      } else if (error.status === 403 && error.response?.data?.message?.includes("rate limit")) {
        errorMessage = "GitHub API rate limit exceeded. Please try again later or provide a GitHub token.";
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
