const brands = ["Apple", "Samsung", "LG", "Xiaomi", "Sony", "Lenovo", "HP", "ASUS", "Bosch", "Philips"];

export default function CitilinkBrands() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Популярные бренды</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {brands.map((brand) => (
          <a
            key={brand}
            href="#"
            className="bg-white border border-[#e0e0e0] rounded px-5 py-3 text-sm font-semibold text-gray-700 hover:border-[#e31e24] hover:text-[#e31e24] transition-colors flex-shrink-0 whitespace-nowrap"
          >
            {brand}
          </a>
        ))}
      </div>
    </div>
  );
}
