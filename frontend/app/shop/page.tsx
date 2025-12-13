'use client';


export default function Shop() {
  return (
    <main className="min-h-screen bg-gray-50">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold mb-4">Shop</h1>
          <p className="text-gray-600 text-lg mb-12">
            Purchase our courses and digital products
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition"
              >
                <div className="bg-gradient-primary h-48 flex items-center justify-center text-white text-6xl">
                  🎓
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Premium Course Bundle
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Complete eBay mastery with lifetime access
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">$99</span>
                    <button className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
  );
}
