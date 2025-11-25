import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Heart, ChefHat } from "lucide-react";

const headingStyle = `font-serif text-3xl md:text-4xl tracking-tight`;

// Typewriter effect hook
const useTypewriter = (text, speed = 30, delay = 0) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
};

export default function VintageRecipeCard({ recipe }) {
  console.log("🎴 VintageRecipeCard rendered with recipe:", recipe);
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  console.log("📊 Recipe title:", recipe.title);
  console.log("📊 Recipe ingredients count:", recipe.ingredients?.length);
  console.log("📊 Recipe steps count:", recipe.steps?.length);

  const titleTyped = useTypewriter(recipe.title, 30, 0);
  const descriptionTyped = useTypewriter(recipe.description || "", 15, 50);

  // Fast loading sequence - 2 seconds total
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowContent(true), 100);
          return 100;
        }
        return prev + 5; // Faster progress
      });
    }, 20); // Faster updates

    return () => clearInterval(progressInterval);
  }, []);

  // Sequential content reveal - faster
  useEffect(() => {
    if (!showContent) return;

    const timeouts = [
      setTimeout(() => setShowTitle(true), 100),
      setTimeout(() => setShowDescription(true), 300),
      setTimeout(() => setShowIngredients(true), 500),
      setTimeout(() => setShowSteps(true), 700),
      setTimeout(() => setShowExtras(true), 900),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [showContent]);

  // Loading screen
  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-amber-50 via-white to-amber-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-amber-100">
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ChefHat className="text-amber-700" size={48} />
              </motion.div>
              
              <div className="w-full">
                <p className="text-center text-amber-900 font-serif text-xl mb-4">
                  Preparing your recipe...
                </p>
                
                <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-800"
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                <p className="text-center text-amber-700 text-sm mt-3 font-medium">
                  {loadingProgress}%
                </p>
              </div>

              <div className="space-y-2 text-center">
                <motion.p
                  className="text-xs text-slate-600"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Crafting ingredients...
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(16,24,40,0.15)" }}
      >
        <div className="p-8 md:p-12" style={{ background: 'linear-gradient(180deg,#fffaf0,#fff6ec)' }}>
          <div style={{ borderRadius: 16, padding: 32, background: 'linear-gradient(180deg, rgba(255,255,250,1), rgba(255,250,240,1))', boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.02)'}}>
            
            {/* Header: Title + meta */}
            <AnimatePresence>
              {showTitle && (
                <motion.header
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                >
                  <div className="flex-1">
                    <h1 className={`${headingStyle} text-amber-900 mb-2`}>
                      {titleTyped.displayText}
                      {!titleTyped.isComplete && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-1 h-8 bg-amber-900 ml-1"
                        />
                      )}
                    </h1>
                    {recipe.subtitle && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-amber-700 italic font-serif"
                      >
                        {recipe.subtitle}
                      </motion.p>
                    )}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    {recipe.time && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 border border-amber-200 shadow-sm">
                        <Clock size={18} className="text-amber-700" />
                        <div className="text-sm font-medium text-slate-800">{recipe.time}</div>
                      </div>
                    )}

                    {recipe.servings && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 border border-amber-200 shadow-sm">
                        <Heart size={18} className="text-amber-700" />
                        <div className="text-sm font-medium text-slate-800">Serves {recipe.servings}</div>
                      </div>
                    )}
                  </motion.div>
                </motion.header>
              )}
            </AnimatePresence>

            {/* Description with typewriter */}
            <AnimatePresence>
              {showDescription && recipe.description && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 p-5 rounded-xl bg-amber-50/50 border border-amber-100"
                >
                  <p className="text-base text-slate-700 leading-relaxed font-serif italic">
                    {descriptionTyped.displayText}
                    {!descriptionTyped.isComplete && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-4 bg-slate-700 ml-1"
                      />
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Two column layout: Ingredients | Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left column - Ingredients */}
              <AnimatePresence>
                {showIngredients && (
                  <motion.aside
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="lg:col-span-1"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/60 p-6 rounded-xl border-2 border-amber-100 shadow-md sticky top-6"
                    >
                      <h3 className="text-2xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <span className="text-3xl">🥘</span>
                        Ingredients
                      </h3>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ing, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            className="flex items-start gap-3 text-sm text-slate-700"
                          >
                            <span className="text-amber-600 text-lg mt-0.5">•</span>
                            <span className="flex-1">
                              {ing.amount && <strong className="text-amber-800">{ing.amount}</strong>}{' '}
                              <span className="text-slate-800">{ing.name}</span>
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {recipe.suggestions && recipe.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 p-5 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30"
                      >
                        <h4 className="text-lg font-serif font-semibold text-amber-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">💡</span>
                          Chef's Tips
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          {recipe.suggestions.map((s, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.7 + i * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <span className="text-amber-600">→</span>
                              <span>{s}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Right column - Steps */}
              <AnimatePresence>
                {showSteps && (
                  <motion.main
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="lg:col-span-2"
                  >
                    <div className="prose prose-lg max-w-none">
                      <h3 className="text-3xl font-serif font-bold text-amber-900 mb-6 flex items-center gap-2">
                        <span className="text-4xl">👨‍🍳</span>
                        Instructions
                      </h3>
                      <ol className="space-y-5 list-none pl-0">
                        {recipe.steps.map((step, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="relative pl-12 pb-5 border-l-2 border-amber-200 last:border-l-0"
                          >
                            <div className="absolute left-0 top-0 -ml-5 w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                              {i + 1}
                            </div>
                            <div className="bg-white/60 p-5 rounded-lg border border-amber-100 shadow-sm">
                              <p className="text-base leading-relaxed text-slate-800 m-0">{step}</p>
                            </div>
                          </motion.li>
                        ))}
                      </ol>
                    </div>

                    {/* Extra sections */}
                    <AnimatePresence>
                      {showExtras && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 p-6 rounded-xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md"
                          >
                            <h4 className="text-xl font-serif font-semibold text-amber-900 mb-3 flex items-center gap-2">
                              <span className="text-2xl">✨</span>
                              Final Touch
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              Little tweaks make a big difference — taste as you go, adjust salt and spices to your preference, 
                              and remember to rest the dish for 2–3 minutes before serving to let the flavors meld beautifully.
                            </p>
                          </motion.div>

                          {recipe.youtubeLinks && recipe.youtubeLinks.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                              className="mt-6 p-6 rounded-xl border-2 border-red-200 bg-red-50/30 shadow-md"
                            >
                              <h4 className="text-xl font-serif font-semibold text-red-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎥</span>
                                Video Tutorials
                              </h4>
                              <div className="space-y-3">
                                {recipe.youtubeLinks.map((l, i) => (
                                  <motion.a
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    href={l}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-red-200 hover:border-red-400 hover:shadow-md transition-all group"
                                  >
                                    <Play size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-blue-700 hover:text-blue-900 hover:underline flex-1 truncate">
                                      {l}
                                    </span>
                                  </motion.a>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 flex items-center gap-4 flex-wrap"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-lg hover:shadow-xl transition-shadow font-medium"
                            >
                              <Play size={18} />
                              <span>Watch Tutorial</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 rounded-2xl border-2 border-amber-300 bg-white/80 text-amber-900 font-medium hover:bg-amber-50 transition-colors"
                            >
                              💾 Save Recipe
                            </motion.button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.main>
                )}
              </AnimatePresence>
            </div>

            {/* footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: showExtras ? 1 : 0 }}
              transition={{ delay: 1 }}
              className="mt-10 pt-6 border-t border-amber-200 text-center"
            >
              <p className="text-xs text-slate-500 italic font-serif">
                Handcrafted with ❤️ • A culinary journey on a digital recipe card
              </p>
            </motion.footer>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
