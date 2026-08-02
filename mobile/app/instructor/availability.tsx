import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
} from "react-native";

import { fonts } from "../../themes/fonts";
import { days } from "../../constants/days";

import AvailabilityCard from "../../components/instructor/AvailabilityCard";


export default function AvailabilityPage() {

  const availability = [
    {
      day: "Monday",
      slots: [
        {
          id: 1,
          start: "8:00 AM",
          end: "9:00 AM",
        },
        {
          id: 2,
          start: "9:00 AM",
          end: "10:00 AM",
        },
      ],
    },

    {
      day: "Wednesday",
      slots: [
        {
          id: 3,
          start: "1:00 PM",
          end: "3:00 PM",
        },
      ],
    },
  ];


  return (
    <SafeAreaView className="flex-1 bg-[#F7F7FB]">

      <ScrollView
        contentContainerClassName="px-4 pb-8 pt-4"
      >

        <Text
          className="mb-4 text-lg uppercase tracking-[0.5px] text-[#1A1A1A]"
          style={{ fontFamily: fonts.bold }}
        >
          Time Availability
        </Text>


        {days.map((day) => {

          const data = availability.find(
            item => item.day === day.label
          );

          return (
            <AvailabilityCard
              key={day.label}
              day={day.label}
              slots={data?.slots ?? []}
            />
          );

        })}


      </ScrollView>

    </SafeAreaView>
  );
}