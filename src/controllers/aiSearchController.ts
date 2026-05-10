import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

interface DDGResult {
  Text: string;
  FirstURL: string;
}

interface DDGResponse {
  Abstract: string;
  AbstractSource: string;
  AbstractURL: string;
  RelatedTopics: DDGResult[];
}

const getAiSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      throw new ApiError(
        400,
        "What would you like to search for? e.g. ?q=bitcoin",
      );
    }

    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q as string)}&format=json&no_html=1&skip_disambig=1`,
    );

    if (!response.ok) {
      throw new ApiError(502, "AI Search provider is temporarily down");
    }

    const data: DDGResponse = await response.json();

    // Logic: If there is an 'Abstract', that is our "AI Answer"
    // If not, we fall back to the first related topic.
    const aiAnswer =
      data.Abstract || (data.RelatedTopics[0]?.Text ?? "No summary found");
    const sourceUrl =
      data.AbstractURL || (data.RelatedTopics[0]?.FirstURL ?? "");

    res.status(200).json({
      success: true,
      service: "AI Search API",
      data: {
        query: q,
        answer: aiAnswer,
        source: data.AbstractSource || "DuckDuckGo",
        link: sourceUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default getAiSearch;
