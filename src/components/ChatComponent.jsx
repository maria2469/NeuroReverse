import React, { useState } from "react";
import axios from "axios";
import { IoAttach, IoLink, IoArrowBack } from "react-icons/io5";
import { motion } from "framer-motion";

const API_BASE_URL = "https://reverse-engineer-production.up.railway.app";

const ChatComponent = () => {
    const [sessionId, setSessionId] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [queriesAndResponses, setQueriesAndResponses] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);

    // Handle File Upload and Generate Session ID
    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("files", file));

        try {
            setLoading(true);

            const uploadUrl = `${API_BASE_URL}/upload`;
            console.log("Making request to:", uploadUrl);  // Log the upload URL to ensure it's HTTPS
            const { data } = await axios.post(uploadUrl, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSelectedFiles(data.uploaded_files || []);
            const newSessionId = `session_${Date.now()}`;
            setSessionId(newSessionId);

            const initUrl = `${API_BASE_URL}/init`;
            console.log("Making request to:", initUrl);  // Log the init URL to ensure it's HTTPS
            await axios.post(initUrl, { urls, session_id: newSessionId });

        } catch (error) {
            console.error("Upload Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch AI Response for a Single Query
    const fetchResponse = async () => {
        if (!sessionId || !inputValue.trim()) return;

        try {
            setLoading(true);

            const queryUrl = `${API_BASE_URL}/query`;
            console.log("Making request to:", queryUrl);  // Log the query URL to ensure it's HTTPS
            await axios.post(queryUrl, { session_id: sessionId, query: inputValue.trim() });

            const fetchUrl = `${API_BASE_URL}/`;
            console.log("Making request to:", fetchUrl);  // Log the fetch URL to ensure it's HTTPS
            const { data } = await axios.get(fetchUrl, { params: { session_id: sessionId, query: inputValue.trim() } });

            if (data.response) {
                setQueriesAndResponses((prev) => [...prev, { query: inputValue.trim(), response: data.response }]);
                setInputValue(""); // Clear input field after submitting
            }
        } catch (error) {
            console.error("Fetch Response Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6">
            <div className="text-center">
                <img src="/images/Aiassitant.jpeg" alt="Benchmark" className="w-40 mx-auto mb-4" />
                <h2 className="text-3xl font-extrabold text-gray-900">AI-Driven Chat Component</h2>
            </div>

            <div className="space-y-4">
                {!showUrlInput ? (
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Upload Your Files:</label>
                        <div className="relative border p-3 w-full rounded-md shadow-sm bg-gray-50 flex items-center gap-2">
                            <IoAttach className="text-gray-600 text-lg" />
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 w-full cursor-pointer"
                            />
                            <span className="text-gray-700">{selectedFiles.length > 0 ? selectedFiles.map(f => f.name).join(", ") : "Choose files..."}</span>
                            {loading && <div className="absolute right-4 text-gray-600"><div className="w-5 h-5 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" /></div>}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2">
                            <IoLink className="text-gray-600 text-lg" />
                            <input
                                type="text"
                                placeholder="Enter URL"
                                onChange={(e) => setUrls([e.target.value])}
                                className="w-full p-2 border-2 border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                )}
                <div
                    className="text-blue-500 cursor-pointer mt-2 flex items-center gap-1"
                    onClick={() => setShowUrlInput((prev) => !prev)}
                >
                    {showUrlInput ? <IoArrowBack /> : <IoLink />}
                    {showUrlInput ? "Back to File Upload" : "Need to add URL?"}
                </div>
            </div>

            <div className="mt-6 flex-grow overflow-y-auto max-h-[300px]">
                <h2 className="text-xl font-semibold mb-4">Ask query and get Response!</h2>
                <div className="overflow-y-auto p-4 bg-white rounded-md shadow-md max-h-[300px]">
                    {queriesAndResponses.map((item, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                            <div className="mb-2">
                                <p className="font-medium">Query {index + 1}:</p>
                                <p className="text-gray-700">{item.query}</p>
                            </div>
                            <div className="mb-2">
                                <p className="font-medium mt-2">Response:</p>
                                <p className="text-gray-700">{item.response}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 mt-6 flex-grow">
                <div>
                    <input
                        type="text"
                        placeholder="Enter your query..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full p-2 border-2 border-gray-300 rounded-lg"
                    />
                </div>

                <div className="flex justify-between gap-4">
                    <button
                        onClick={fetchResponse}
                        disabled={loading}
                        className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400"
                    >
                        {loading ? "Processing..." : "Send Query"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
