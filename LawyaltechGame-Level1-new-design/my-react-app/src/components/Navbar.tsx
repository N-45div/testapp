import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { FaTools } from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    const routes: Record<string, string> = {
      "/Level-Two-Part-Two": "Document",
      "/Questionnaire": "Questionnaire",
      "/Live_Generation": "Live Document Generation",
      "/Live_Generation_2": "Live Document Generation",
      "/Finish": "Generated Document",
    };

    const activeLabel = routes[location.pathname] || null;
    console.log("Current pathname:", location.pathname, "Active label:", activeLabel);
    setActiveButton(activeLabel);
  }, [location.pathname]);

  const handlePageChange = (label: string) => {
    const routes: Record<string, string> = {
      Document: "/Level-Two-Part-Two",
      Questionnaire: "/Questionnaire",
      "Live Document Generation": "/Live_Generation",
      "Generated Document": "/Finish",
    };

    const path = routes[label];
    console.log("Navigating to:", path);
    if (path) {
      navigation(path);
    }
  };

  return (
    <div className="w-full bg-lime-300 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex">
            {location.pathname !== "/Finish" ? (
              ["Document", "Questionnaire", "Live Document Generation"].map((label) => (
                <button
                  key={label}
                  className={`px-8 py-3 cursor-pointer bg-lime-300 font-medium border-r border-lime-400 hover:bg-lime-400 transition-colors duration-200 flex items-center space-x-2 ${
                    activeButton === label ? "text-gray-700" : "text-blue-600"
                  }`}
                  onClick={() => handlePageChange(label)}
                >
                  <span>{label}</span>
                </button>
              ))
            ) : (
              <div className="flex-1 flex justify-end pr-75">
                <span className="px-8 py-3 bg-lime-300 font-medium text-blue-600 flex items-center space-x-2 text-xl">
                  <span>Generated Document</span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center px-6 space-x-6">
            <span className="text-blue-600 text-xl font-semibold tracking-wide">
              Contractual
            </span>
            <div className="relative flex items-center">
              <button
                className="p-2 rounded-full cursor-pointer hover:bg-lime-400 transition-colors duration-200 flex items-center justify-center text-2xl"
                onMouseEnter={() => setTooltip("Settings")}
                onMouseLeave={() => setTooltip(null)}
              >
                <FaTools />
              </button>
              {tooltip === "Settings" && (
                <div className="absolute top-full mb-2 px-3 py-1 text-sm text-white bg-gray-500 rounded shadow-md whitespace-nowrap">
                  Settings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;




// original