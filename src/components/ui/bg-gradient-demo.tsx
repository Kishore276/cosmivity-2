import { BgGradient } from "@/components/ui/bg-gradient";

export default function BgGradientDemo() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Default gradient */}
      <BgGradient />
      
      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Background Gradient Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            This component creates beautiful radial gradient backgrounds that can be customized
            with different colors, sizes, and positions.
          </p>
          
          {/* Example variations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="relative h-32 rounded-lg overflow-hidden border">
              <BgGradient 
                gradientFrom="#ff6b6b" 
                gradientTo="#4ecdc4" 
                gradientPosition="30% 30%"
              />
              <div className="relative z-10 p-4 text-white font-semibold">
                Coral to Teal
              </div>
            </div>
            
            <div className="relative h-32 rounded-lg overflow-hidden border">
              <BgGradient 
                gradientFrom="#a8edea" 
                gradientTo="#fed6e3" 
                gradientPosition="70% 20%"
                gradientSize="150% 150%"
              />
              <div className="relative z-10 p-4 text-gray-800 font-semibold">
                Mint to Pink
              </div>
            </div>
            
            <div className="relative h-32 rounded-lg overflow-hidden border">
              <BgGradient 
                gradientFrom="#ffecd2" 
                gradientTo="#fcb69f" 
                gradientPosition="50% 80%"
                gradientStop="20%"
              />
              <div className="relative z-10 p-4 text-gray-800 font-semibold">
                Peach Gradient
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
