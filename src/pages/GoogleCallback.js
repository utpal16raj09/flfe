import { useEffect } from "react";

function GoogleCallback() {
  useEffect(() => {
    fetch("http://localhost:8080/auth/google/success", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("GOOGLE LOGIN SUCCESS:", data);
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/";
      })
      .catch(err => console.error("ERROR:", err));
  }, []);

  return <h2>Signing you in...</h2>;
}

export default GoogleCallback;
