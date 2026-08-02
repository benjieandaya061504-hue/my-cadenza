import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { fonts } from "../../themes/fonts";
import { days } from "../../constants/days";
import { schedules } from "@/constants/schedules";

import ScheduleCard from "../../components/instructor/ScheduleCard";


export default function SchedulePage() {

  const [selectedDay, setSelectedDay] = useState("Monday");


  const filteredSchedules = schedules.filter(
    (item) => item.day === selectedDay
  );


  return (
    <SafeAreaView className="flex-1 bg-[#F7F7FB]">


      {/* Day Tabs */}
      <View className="mt-4">

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4"
        >

          {days.map((day) => (

            <TouchableOpacity
              key={day.label}
              onPress={() => setSelectedDay(day.label)}
              className={`mr-2 h-10 w-10 items-center justify-center rounded-full ${selectedDay === day.label
                  ? "bg-blue-600"
                  : "bg-white"
                }`}
            >

              <Text
                className={`text-sm ${selectedDay === day.label
                    ? "text-white"
                    : "text-[#555]"
                  }`}
                style={{
                  fontFamily: fonts.bold
                }}
              >
                {day.short}
              </Text>

            </TouchableOpacity>

          ))}

        </ScrollView>

      </View>



      <ScrollView
        contentContainerClassName="px-4 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >

        <Text
          className="mb-4 text-lg uppercase tracking-[0.5px] text-[#1A1A1A]"
          style={{
            fontFamily: fonts.bold
          }}
        >
          {selectedDay} Schedule
        </Text>



        {filteredSchedules.length > 0 ? (

          filteredSchedules.map((item) => (

            <ScheduleCard
              key={item.id}
              lesson={item.lesson}
              time={item.time}
              student={item.student}
            />

          ))

        ) : (

          <Text
            className="text-sm text-[#999]"
            style={{
              fontFamily: fonts.regular
            }}
          >
            No schedule available.
          </Text>

        )}


      </ScrollView>


    </SafeAreaView>
  );
}