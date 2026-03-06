import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Order Successful!
                </h1>
                <p className="text-gray-500 text-lg mb-8">
                    Thank you for choosing Sandhya Furnishing. Your order has been placed successfully and will be processed shortly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/user/orders"
                        className="px-6 py-3 bg-[#142C2C] text-white font-semibold rounded-xl hover:bg-[#9B804E] transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                        View My Orders
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm w-full sm:w-auto"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
