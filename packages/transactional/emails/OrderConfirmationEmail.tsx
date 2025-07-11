import {
  Tailwind,
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Section,
  Text,
  Link,
  Img,
} from "@react-email/components";

import * as React from "react";

interface OrderConfirmationEmailProps {
  bookingDate: string;
  menuSelections: {
    name: string;
    portion: string;
    singleChoice: string;
    multipleChoices: string[];
    sides: { id: string; name: string; ingredients: string }[];
    notes: string;
  }[];
  culinaryPreferences: string[];
  groceryPreferences: string[];
}

export const OrderConfirmationEmail = ({
  bookingDate,
  menuSelections,
  culinaryPreferences,
  groceryPreferences,
}: OrderConfirmationEmailProps): React.ReactElement => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Your Easyfeast Menu Has Been Received!</Preview>
        <Body>
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[24px] font-sans">
            <Container align="center" className="mb-[24px]">
              <Img
                src="https://images.squarespace-cdn.com/content/v1/5a032bddb1ffb6c0ffac4860/1553803431373-7GYZNAY8YHRXYCOTSIV8/EasyFeast_Logo_Web._800x120.png?format=750w"
                alt="Easyfeast Logo"
                width={160}
              />
            </Container>

            <Section>
              <Text>Greetings from Easyfeast!</Text>

              <Text>
                Thank you for submitting your menu selections - we've received
                your choices for your booking on {bookingDate}.
              </Text>

              <Text>Here's what you'll be enjoying:</Text>

              {menuSelections?.length > 0 && (
                <div>
                  {menuSelections.map((selection, index) => {
                    const selections = [];

                    if (selection.singleChoice) {
                      selections.push(selection.singleChoice);
                    }

                    if (selection.multipleChoices.length > 0) {
                      selections.push(selection.multipleChoices.join(", "));
                    }

                    if (selection.sides.length > 0) {
                      selections.push(selection.sides.join(", "));
                    }

                    return (
                      <Section className="mb-[36px]">
                        <div className="mr-[32px] ml-[12px] inline-flex items-start">
                          <div className="mr-[18px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#094c3e] font-semibold text-white text-[12px] leading-none">
                            {index + 1}
                          </div>
                          <div>
                            <Heading
                              as="h2"
                              className="mt-[0px] mb-[8px] text-gray-900 text-[18px] leading-[28px]"
                            >
                              {selection.name} ({selection.portion})
                            </Heading>

                            {selections.length > 0 && (
                              <Text className="m-0 text-gray-500 text-[14px] leading-[24px]">
                                {selections.join(", ")}
                              </Text>
                            )}

                            {selection.notes && (
                              <Text className="m-0 text-gray-500 text-[14px] leading-[24px]">
                                Notes: {selection.notes}
                              </Text>
                            )}
                          </div>
                        </div>
                      </Section>
                    );
                  })}
                </div>
              )}

              <Text>
                If you'll be doing the grocery shopping or marking up the
                shopping list, you can expect to hear from us within
                approximately 24 hours. Otherwise, you're all set!
              </Text>

              <Text>
                If you have any questions, please reach out to us at{" "}
                <Link href="mailto:menus@easyfeast.com">
                  menus@easyfeast.com
                </Link>
                .
              </Text>

              <Text>
                Warmly,
                <br />
                The Easyfeast Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default OrderConfirmationEmail;
