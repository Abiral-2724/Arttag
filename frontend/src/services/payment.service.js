export const createOrder = async (amount, userId) => {
    const res = await fetch(
      "http://localhost:8000/api/v1/payment/create/order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, userId }),
      }
    );
  
    return await res.json();
  };
  