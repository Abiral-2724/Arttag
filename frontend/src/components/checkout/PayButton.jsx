import { createOrder } from "@/services/payment.service";

export default function PayButton({ userId }) {
  const handlePayNow = async () => {
    const order = await createOrder(500, userId);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      handler: async (response) => {
        await fetch(
          "http://localhost:8000/api/v1/payment/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          }
        );
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return <button onClick={handlePayNow}>Pay Now</button>;
}
