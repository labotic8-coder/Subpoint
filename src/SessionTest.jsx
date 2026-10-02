import React from "react";

export default function CorsTest() {

  const testCors = async () => {

    try {

      console.log("STARTING CORS TEST...");

      const response = await fetch(
        "http://beamaxtechpractical.online/API/login_test.php",
        {
          method: "POST",

          headers: {
            Accept: "application/json",
          },

          body: new URLSearchParams({
  email: "daniel@gmail.com",
  password: "YOUR_ACTUAL_PASSWORD",
}),
        }
      );

      console.log(
        "STATUS:",
        response.status
      );

      const text = await response.text();

      console.log(
        "RAW RESPONSE:",
        text
      );

    } catch (error) {

      console.error(
        "CORS TEST FAILED:",
        error
      );

    }

  };


  return (

    <div
      style={{
        padding: "40px",
      }}
    >

      <h1>CORS Test</h1>

      <button
        onClick={testCors}
      >
        Test CORS
      </button>

    </div>

  );

}