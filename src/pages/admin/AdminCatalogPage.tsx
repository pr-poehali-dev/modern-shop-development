import Icon from "@/components/ui/icon";

export default function AdminCatalogPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Каталог товаров</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center gap-3 text-center">
        <Icon name="Package" size={40} className="text-gray-300" />
        <p className="text-gray-500">Управление каталогом пока недоступно</p>
      </div>
    </div>
  );
}
