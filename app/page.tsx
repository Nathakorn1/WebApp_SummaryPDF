"use client";

import { useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  // These variables remember the file you select, the loading state, and the AI's answer
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // This function runs when you click "Summarize"
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setSummary("");

    // Package the file up to send to our backend
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send the file to the secure API route we built earlier
      const res = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.summary) {
        setSummary(data.summary);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong uploading the file!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">AI PDF Summarizer</h1>
      
      {/* Shows if the user is NOT logged in */}
      <Show when="signed-out">
        <div className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <SignInButton mode="modal" />
        </div>
      </Show>
      
      {/* Shows if the user IS logged in */}
      <Show when="signed-in">
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          <div className="self-end">
            <UserButton />
          </div>

          {/* The Upload Form */}
          <form onSubmit={handleUpload} className="flex flex-col gap-4 w-full p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
            />
            <button 
              type="submit" 
              disabled={!file || loading}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Reading and Summarizing..." : "Summarize PDF"}
            </button>
          </form>
          
          {/* The AI Summary Result Box */}
          {summary && (
            <div className="mt-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl w-full shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-600">Your AI Summary:</h3>
              <div className="whitespace-pre-wrap leading-relaxed">
                {summary}
              </div>
            </div>
          )}
        </div>
      </Show>
    </main>
  );
}