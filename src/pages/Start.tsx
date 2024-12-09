import { getCoreStream, NormalEvent } from "@/core/stream";
import React, { useState } from "react";

export default function Start() {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    getCoreStream().publish({
      type: NormalEvent.USER_SET_NAME,
      payload: name,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[320px] rounded-lg border border-gray-800 bg-gray-900/50 p-6 shadow-lg backdrop-blur-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-200">
          凡尘入世
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full rounded-md border border-gray-700 bg-gray-800 px-4 text-lg text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              required
              placeholder="请输入道号"
            />
          </div>
          <button
            type="submit"
            className="h-12 w-full rounded-md bg-blue-600 text-lg font-medium text-white active:bg-blue-700"
          >
            踏入修仙之路
          </button>
        </form>
      </div>
    </div>
  );
}
