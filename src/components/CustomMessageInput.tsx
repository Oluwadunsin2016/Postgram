import React from "react";
import { useMessageInputContext, MessageInput } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const CustomMessageInput: React.FC = () => {
  const {
    handleSubmit,
    text,
    handleChange,
    openFilePicker,
    fileUploads,
    removeFile,
  } = useMessageInputContext();

  return (
    <div className="p-4 bg-gray-800">
      <div className="flex items-center bg-gray-700 text-white rounded-full px-4 py-2">
        {/* File Upload Button */}
        <button
          className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full hover:bg-gray-500"
          onClick={openFilePicker}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.75v14.5m7.25-7.25H4.75"
            />
          </svg>
        </button>

        {/* Display Uploaded Files */}
        {/* {Object.values(fileUploads).length > 0 && (
          <div className="flex items-center space-x-2 px-2">
            {Object.values(fileUploads).map((file) => (
              <div key={file.id} className="relative flex items-center">
                <span className="text-sm truncate">{file.file.name}</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )} */}

        {/* Text Input */}
        <textarea
          value={text}
          onChange={handleChange}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="flex-1 bg-transparent text-sm text-white px-4 py-1 focus:outline-none placeholder-gray-400 resize-none"
          placeholder="Type your message..."
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full hover:bg-gray-500 ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.25 12h13.5m-13.5 0l6.75 6.75m-6.75-6.75l6.75-6.75"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CustomMessageInput;
