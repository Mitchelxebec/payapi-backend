import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

interface NewsArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
  url: string;
  urlToImage: string;
  publishedAt: string;
}

const getNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q } = req.query;
    const SECRET_NEWS_KEY = process.env.NEWS_API_KEY;

    if (!q) {
      throw new ApiError(400, "Missing search query. e.g. ?q=bitcoin");
    }

    if (!SECRET_NEWS_KEY) {
      throw new ApiError(500, "News Service is not configured on the server");
    }

    // We limit results to 5 for the MVP to keep it fast
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q as string)}&pageSize=5&language=en&apiKey=${SECRET_NEWS_KEY}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("NewsAPI Error: ", errorData);
      throw new ApiError(502, "External News Provider failed to respond");
    }

    const data = await response.json();

    // 4. Transform data (Don't just dump the raw response)
    // We map only the fields our users actually need
    const cleanArticles = data.articles.map((article: NewsArticle) => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      link: article.url,
      image: article.urlToImage,
      date: article.publishedAt,
    }));

    res.status(200).json({
      success: true,
      service: "News API",
      count: cleanArticles.length,
      data: cleanArticles,
    });
  } catch (error) {
    next(error);
  }
};

export default getNews;
