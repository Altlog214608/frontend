import React, { useEffect, useState } from "react";

const TestPage = () => {
  const [message, setMessage] = useState("불러오는 중...");

  useEffect(() => {
    fetch("http://localhost:8080/api/hello")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => setMessage("에러 발생: " + err.message));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🚀 Spring Boot 연동 테스트</h1>
      <p>{message}</p>
    </div>
  );
};

export default TestPage;
