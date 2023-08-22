"use client";

import { useDispatch, useSelector } from "react-redux";

import { FormattedMessage } from "react-intl";
import { setCurrentBooking } from "@/redux/features/bookingSlice";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function WelcomeMessage() {
  const dispatch = useDispatch();
  const booking = useSelector((state) => state.booking);
  const { isLoaded, isSignedIn, user } = useUser();
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  useEffect(() => {
    fetch("/api/booking/next", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        dispatch(setCurrentBooking(data));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  return (
    <>
      <div className="flex justify-between gap-4">
        <div>
          <FormattedMessage
            id="components.welcomeMessage.message"
            defaultMessage="Hi"
          />
          , {isLoaded && isSignedIn && <span>{user.firstName}</span>}
        </div>
        <div className="grow text-center">
          <FormattedMessage
            id="components.welcomeMessage.bookingTime"
            defaultMessage="Booking Time"
          />
          : <strong>{dateFormatter.format(new Date(booking.datetime))}</strong>
        </div>
      </div>
    </>
  );
}
