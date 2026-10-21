
const sampleAvailability = {
  teacherName: "Teacher Account",
  isAvailable: true,
  availableDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ],
  timeSlots: [
    {
      id: 1,
      startTime: "10:00",
      endTime: "12:00",
      subject: "DBMS",
      isAvailable: true
    },
    {
      id: 2,
      startTime: "12:00",
      endTime: "14:00",
      subject: "Data Structures",
      isAvailable: true
    },
    {
      id: 3,
      startTime: "14:00",
      endTime: "16:00",
      subject: "Java",
      isAvailable: true
    }
  ]
};

export default sampleAvailability;
