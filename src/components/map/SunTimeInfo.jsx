import React, { useEffect, useState } from "react";

const SunTimeInfo = () => {
  const [sunriseGangneung, setSunriseGangneung] = useState("N/A");
  const [sunsetIncheon, setSunsetIncheon] = useState("N/A");

  const toKST = (utcTime) =>
    new Date(utcTime).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    // 강릉 일출
    fetch("https://api.sunrise-sunset.org/json?lat=37.7519&lng=128.8761&date=today&formatted=0")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "OK") {
          setSunriseGangneung(toKST(data.results.sunrise));
        }
      });

    // 인천 일몰
    fetch("https://api.sunrise-sunset.org/json?lat=37.4563&lng=126.7052&date=today&formatted=0")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "OK") {
          setSunsetIncheon(toKST(data.results.sunset));
        }
      });
  }, []);

  return (
    <div className="sunshine_hours">
      <div className="sunrise_date">강릉 일출시간: {sunriseGangneung}</div>
      <div className="sunset_time">인천 일몰시간: {sunsetIncheon}</div>
    </div>
  );
};

export default SunTimeInfo;
