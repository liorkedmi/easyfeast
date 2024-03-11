"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch, useSelector } from "react-redux";

import { FormattedMessage } from "react-intl";
import { setCurrentBooking } from "@/redux/features/bookingSlice";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function WelcomeMessage({ bookingInfo, mode }) {
  const dispatch = useDispatch();
  const booking = useSelector((state) => state.booking);
  const { user } = useUser();
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  useEffect(() => {
    if (!bookingInfo.error) {
      dispatch(setCurrentBooking(bookingInfo));
    }
  });

  if (bookingInfo.error) {
    return (
      <div className="flex justify-between gap-4">
        <div className="grow text-center text-sm tracking-wider">
          <h2 className="text-sm tracking-wider opacity-70">
            <FormattedMessage
              id="components.welcomeMessage.error"
              defaultMessage="Error loading booking information"
            />
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <div className="grow text-center text-sm tracking-wider">
          {user && booking.datetime ? (
            <>
              <>
                {mode === "booking" ? (
                  <>
                    <span className="text-sm print:hidden">
                      <FormattedMessage
                        id="components.welcomeMessage.prefix"
                        defaultMessage="Greetings, {name}! Please select your {upcomingMenu} from any of the categories below:"
                        values={{
                          name: user.firstName,
                          upcomingMenu: (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="underline decoration-dotted">
                                  upcoming menu
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span className="font-semibold">
                                  {dateFormatter.format(
                                    new Date(booking.datetime)
                                  )}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          ),
                        }}
                      />
                    </span>
                    <span className="text-sm screen:hidden">
                      Chef {booking.chefName} | {booking.clientName} |{" "}
                      {dateFormatter.format(new Date(booking.datetime))}
                    </span>
                  </>
                ) : (
                  <span className="text-sm">
                    Chef {booking.chefName} | {booking.clientName} |{" "}
                    {dateFormatter.format(new Date(booking.datetime))}
                  </span>
                )}
              </>
            </>
          ) : (
            <h2 className="text-sm tracking-wider opacity-70">
              {mode === "booking" ? (
                <span>
                  <FormattedMessage
                    id="components.welcomeMessage.loadNextAvailableBooking"
                    defaultMessage="Loading next available booking"
                  />
                </span>
              ) : (
                <span>
                  <FormattedMessage
                    id="components.welcomeMessage.loadBookingInformation"
                    defaultMessage="Loading booking information"
                  />
                </span>
              )}
            </h2>
          )}
        </div>
      </div>
    </>
  );
}
