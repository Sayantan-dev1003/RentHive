import React from "react";

const wishlistItems = [
  {
    id: 1,
    img: "https://storage.googleapis.com/a1aa/image/d1e41ced-0abc-4e23-406f-89bb603d73e6.jpg",
    alt: "Light brown wooden chair on a light gray background",
    title: "T-shirts combo for men",
    price: "$12.00",
    status: "In stock",
    active: false,
  },
  {
    id: 2,
    img: "https://storage.googleapis.com/a1aa/image/acce90b4-29a8-4066-efab-40c60d8ffc10.jpg",
    alt: "Small dark gray sofa on a light gray background",
    title: "T-shirts combo for men",
    price: "$12.00",
    status: "In stock",
    active: false,
  },
  {
    id: 3,
    img: "https://storage.googleapis.com/a1aa/image/2b9a9997-a0c6-411f-e9e6-69f5bee96e7c.jpg",
    alt: "Yellow tape roll on a light gray background",
    title: "T-shirts combo for men",
    price: "$12.00",
    status: "In stock",
    active: true,
  },
  {
    id: 4,
    img: "https://storage.googleapis.com/a1aa/image/b1f36c0a-7b58-4242-3f93-7960c63bb089.jpg",
    alt: "Light wooden shelf with items on a light gray background",
    title: "T-shirts combo for men",
    price: "$12.00",
    status: "In stock",
    active: false,
  },
];

export default function Wishlist() {
  return (
    <div className="bg-black min-h-screen font-['Inter'] text-black p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center font-semibold text-base sm:text-lg text-black mb-6 sm:mb-8">
          <i className="fas fa-arrow-left mr-2 cursor-pointer text-base sm:text-lg"></i>
          <span>Your Wishlist</span>
          <i className="fas fa-heart text-red-600 ml-2 text-base sm:text-lg"></i>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="font-normal pb-3 text-left">Items</th>
                <th className="font-normal pb-3 text-left">Product title</th>
                <th className="font-normal pb-3 text-left">Price</th>
                <th className="font-normal pb-3 text-left">Status</th>
                <th className="font-normal pb-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlistItems.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 border-gray-200">
                  <td className="py-4 align-middle">
                    <div className="w-14 h-14 bg-gray-100 flex justify-center items-center rounded">
                      <img
                        src={item.img}
                        alt={item.alt}
                        className="max-w-10 max-h-10 object-contain"
                      />
                    </div>
                  </td>
                  <td className="max-w-[180px] font-normal">{item.title}</td>
                  <td className="whitespace-nowrap">{item.price}</td>
                  <td className="whitespace-nowrap">{item.status}</td>
                  <td>
                    <button
                      className={`text-black border border-gray-300 rounded-full px-4 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                        item.active
                          ? "bg-green-700 border-green-700 text-white"
                          : "hover:border-gray-500"
                      }`}
                    >
                      <i className="fas fa-shopping-cart text-xs"></i>
                      Add to cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 flex justify-center items-center rounded">
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="max-w-10 max-h-10 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-normal">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.status}</p>
                  <p className="text-sm font-medium">{item.price}</p>
                </div>
              </div>
              <button
                className={`text-black border border-gray-300 rounded-full px-3 py-1 text-xs flex items-center gap-2 transition-colors ${
                  item.active
                    ? "bg-green-700 border-green-700 text-white"
                    : "hover:border-gray-500"
                }`}
              >
                <i className="fas fa-shopping-cart text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
