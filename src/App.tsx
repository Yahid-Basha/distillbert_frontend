import { useState } from "react";

const App = () => {
  // State management
  const [query, setQuery] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    relationship: string;
    confidence: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // API configuration - using environment variable with fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Example data for one-click testing
  const examples = [
    {
      type: "Exact",
      icon: "✅",
      query: "iPhone 15 Pro",
      description:
        "Apple iPhone 15 Pro, 256GB, Natural Titanium. Features a 6.1-inch Super Retina XDR display, A17 Pro chip, and pro-grade camera system.",
    },
    {
      type: "Substitute",
      icon: "🔄",
      query: "sony noise cancelling headphones",
      description:
        "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones, Bluetooth, Over-Ear with immersive audio.",
    },
    {
      type: "Complement",
      icon: "➕",
      query: "airpods",
      description:
        "Estuche de Carga Inalámbrica con Botón de Sincronización Compatible con AirPods 1 y 2 Reemplazo con Emparejamiento Bluetooth (Air Pods no Incluidas), Cubierta Protectora para Auriculares (Blanco)  Lopnord",
    },
    {
      type: "Irrelevant",
      icon: "❌",
      query: "noise cancelling headphones",
      description:
        "Nike Air Max running shoes for men, comfortable and stylish for everyday athletic wear.",
    },
  ];

  // Main classification function
  const classifyRelationship = async () => {
    if (!query.trim() || !productDescription.trim()) {
      setError(
        "Please fill in both the search query and product description fields."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowResult(false);

    try {
      const response = await fetch(`${API_URL}/classify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          product_description: productDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setShowResult(true);
    } catch {
      setError(
        "Failed to classify the relationship. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle try another classification
  const tryAnother = () => {
    setShowResult(false);
    setResult(null);
    setError(null);
    setQuery("");
    setProductDescription("");
  };

  // Handle example button clicks
  const loadExample = (example: (typeof examples)[0]) => {
    setQuery(example.query);
    setProductDescription(example.description);
    setResult(null);
    setError(null);
    setShowResult(false);
  };

  // Get display information for results
  const getResultDisplay = (relationship: string) => {
    const displays: Record<
      string,
      { icon: string; color: string; interpretation: string }
    > = {
      exact: {
        icon: "✅",
        color: "text-green-600",
        interpretation:
          "The product matches the search query exactly. This is a perfect match for what the user is looking for.",
      },
      substitute: {
        icon: "🔄",
        color: "text-orange-600",
        interpretation:
          "The product could serve as an alternative to what was searched. It fulfills similar needs or functions.",
      },
      complement: {
        icon: "➕",
        color: "text-purple-600",
        interpretation:
          "The product complements what was searched for. It would work well together with the searched item.",
      },
      irrelevant: {
        icon: "❌",
        color: "text-red-600",
        interpretation:
          "The product is not related to the search query. There is no meaningful connection between them.",
      },
    };

    return (
      displays[relationship.toLowerCase()] || {
        icon: "❓",
        color: "text-gray-600",
        interpretation: "Unknown relationship type detected.",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-2xl">🛍️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            AI Shopping Query Classifier
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Analyze the relationship between Amazon search queries and product
            descriptions using advanced AI classification
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>Powered by</span>
            <a
              href="https://huggingface.co/yahid/distilbert-base-uncased-finetuned-amazon-kdd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              <span>🤗</span>
              <span>DistilBERT Fine-tuned Model</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>

        {/* Main Content - Input Form or Results */}
        {!showResult ? (
          <>
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Enter Your Data
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Search Query
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter the Amazon search query here..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-gray-800 placeholder-gray-400"
                    rows={5}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Description
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Enter the product description here..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-gray-800 placeholder-gray-400"
                    rows={5}
                  />
                </div>
              </div>

              {/* Classify Button */}
              <div className="text-center mt-8">
                <button
                  onClick={classifyRelationship}
                  disabled={
                    loading || !query.trim() || !productDescription.trim()
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Classifying...</span>
                    </div>
                  ) : (
                    "Classify Relationship"
                  )}
                </button>
              </div>

              {/* Loading State with Professional Message */}
              {loading && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Processing Your Request
                    </h3>
                    <p className="text-blue-700 mb-3">
                      Our AI model is analyzing the relationship between your
                      query and product description.
                    </p>
                    <div className="bg-blue-100 rounded-lg p-4 text-sm text-blue-800">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-0.5">ℹ️</span>
                        <div className="text-left">
                          <p className="font-medium mb-1">
                            First-time initialization
                          </p>
                          <p>
                            If this is your first request, the server may take
                            50-100 seconds to initialize the AI model.
                            Subsequent requests will be much faster.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold text-red-800">
                        Classification Failed
                      </div>
                      <p className="text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* One-Click Examples */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                One-Click Examples
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Click any example below to instantly populate the input fields
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example)}
                    className="group p-5 border-2 border-gray-200 hover:border-blue-300 rounded-xl hover:bg-blue-50 transition-all duration-200 text-left transform hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{example.icon}</span>
                      <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                        {example.type}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {example.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Results Section */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Classification Result
              </h2>
              <button
                onClick={tryAnother}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Try Another
              </button>
            </div>

            {result && (
              <div className="space-y-6">
                {/* Query and Description Display */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Search Query
                    </h3>
                    <p className="text-gray-800">{query}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Product Description
                    </h3>
                    <p className="text-gray-800">{productDescription}</p>
                  </div>
                </div>

                {/* Main Result Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">
                        {getResultDisplay(result.relationship).icon}
                      </div>
                      <div>
                        <div
                          className={`text-2xl font-bold capitalize ${getResultDisplay(result.relationship).color}`}
                        >
                          {result.relationship} Match
                        </div>
                        <div className="text-lg text-gray-600">
                          Confidence: {(result.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-sm text-gray-500 mb-2">
                        Confidence Level
                      </div>
                      <div className="w-full md:w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        {/* Dynamic width requires inline style */}
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out"
                          style={{
                            width: `${result.confidence * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Interpretation
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {getResultDisplay(result.relationship).interpretation}
                  </p>
                </div>

                {/* Confidence Indicator */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">High</div>
                    <div className="text-sm text-green-600">80-100%</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="font-semibold text-yellow-800">Medium</div>
                    <div className="text-sm text-yellow-600">60-79%</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="font-semibold text-red-800">Low</div>
                    <div className="text-sm text-red-600">Below 60%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Powered by AI classification algorithms</p>
        </div>
      </div>
    </div>
  );
};

export default App;
