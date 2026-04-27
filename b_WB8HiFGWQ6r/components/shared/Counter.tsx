"use client";
import React, { useState, useEffect } from "react";

const CountdownTimer = () => {
  // Target date: November 21, 2024
  const targetDate = new Date("2024-11-25T00:00:00").getTime();

  // State to hold the remaining time
  const [timeRemaining, setTimeRemaining] = useState(targetDate - new Date().getTime());

  useEffect(() => {
    // Update the countdown every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = targetDate - now;
      setTimeRemaining(remaining);

      // Clear interval if the countdown is complete
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [targetDate]);

  // Calculate days, hours, minutes, and seconds from remaining time
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <div className="text-center text-2xl pt-4 font-semibold">
      {timeRemaining > 0 ? (
        <div className="countdown flex gap-4">
          <span>{days} days</span> {"   "}  <span>{hours} hours</span> {"   "} <span>{minutes} minutes</span> {"   "}   <span>{seconds} seconds</span>
        </div>
      ) : (
        <p>Countdown complete!</p>
      )}
    </div>
  );
};

export default CountdownTimer;
