// js/tasks.js

export const tasks = [
    {
        id: 0,
        title: "Task 1: Chula -> Siriraj Hospital / ภารกิจที่ 1: จุฬาฯ → โรงพยาบาลศิริราช",
        startTime: "12:00",
        description: `
Current Time: 12:00
Scenario: You have a doctor's appointment at Siriraj Hospital at 13:00. You want to save money, but you cannot be late.
Constraints: 
1. Cost must be UNDER 100 THB.
2. Choose the FASTEST route within the budget.

---
เวลาปัจจุบัน: 12:00 น.
สถานการณ์: คุณมีนัดพบแพทย์ที่โรงพยาบาลศิริราชเวลา 13:00 น. คุณต้องการประหยัดค่าเดินทาง และ ห้ามไปสายเด็ดขาด
เงื่อนไข:
1. ค่าเดินทางต้อง ไม่เกิน 100 บาท
2. เลือกเส้นทางที่ เร็วที่สุด ภายใต้งบประมาณนี้
        `,
        origin: { lat: 13.7384, lng: 100.5315, name: "Chulalongkorn Univ." },
        dest:   { lat: 13.7593, lng: 100.4854, name: "Siriraj Hospital" },

        grab: [
                { type: "JustGrab", cost: "THB 160", time: "", wait: "10 min" },
                { type: "GrabBike", cost: "THB 105", time: "", wait: "3 min" }
        ],
        bolt: [
                { type: "Bolt", cost: "THB 150", time: "", wait: "5 min" },
                { type: "Bolt Bike", cost: "THB 110", time: "", wait: "2 min" }
        ],
        google: {
            routes: [
                {
                    type: "car",
                    summary: "🚗 Car",
                    details: "Moderate traffic",
                    cost: "", 
                    time: "35 min"
                },
                {
                    type: "transit",
                    summary: "🚍Bus 529/4-28 → ⛴️Blue flag",
                    details: "From 2 Kings Monument, 12:07",
                    cost: "THB 35",
                    time: "55 min"
                },
                {
                    type: "transit",
                    summary: "🚆MRT Blue → 🚍Bus 57/4-41",
                    details: "From Sam Yan St., via Itsaraphap",
                    cost: "THB 45",
                    time: "70 min"
                },
                {
                    type: "transit",
                    summary: "🚍Bus 47/3-41 → 🚍Bus 509/4-60",
                    details: "From Faculty of Education, 12:26",
                    cost: "THB 25",
                    time: "80 min"
                },
                {
                    type: "walk",
                    summary: "🚶 Walk only",
                    details: "",
                    cost: "",
                    time: "120 min"
                }
            ],
        },

        moovit: {
            routes: [
                {
                    summary: "🚍Bus 47/3-41 → 🚍Bus 509/4-60",
                    details: "From Faculty of Education, 12:06",
                    cost: "THB 25",
                    time: "60 min"
                },
                {
                    summary: "🚆MRT Blue → ⛴️City Line",
                    details: "From Sam Yan St., via Sanam Chai",
                    cost: "THB 50",
                    time: "50 min"
                },
                {
                    summary: "🚍Bus M4 → 🚍Bus 91",
                    details: "From Satit Patumwan, 12:20",
                    cost: "THB 30",
                    time: "55 min"
                }
            ],
        },

        viabus: {
            stops: [
                {
                    id: "stop_edu_1",
                    name: "Faculty of Education",
                    lat: 13.73805, lng: 100.52943,
                    lines: [
                        { 
                            number: "47/3-41", 
                            color: "#d63031", 
                            dest: "Pharachawang police sta.", 
                            wait: "5 min", // On time
                            busLat: 13.7375, busLng: 100.5295 
                        }
                    ]
                },
                {
                    id: "stop_satit_1",
                    name: "Satit Patumwan school",
                    lat: 13.73924, lng: 100.53482,
                    lines: [
                        { 
                            number: "M4", 
                            color: "#6c5ce7", 
                            dest: "Sanam Luang", 
                            wait: "20 min", 
                            busLat: 13.7425, busLng: 100.5315 
                        }
                    ]
                },
                {
                    id: "2kings_1",
                    name: "Two kings monument",
                    lat: 13.73814, lng: 100.52971,
                    lines: [
                        { 
                            number: "529/4-28", 
                            color: "#0984e3", 
                            dest: "Samae Dam", 
                            wait: "7 min", 
                            busLat: 13.7310, busLng: 100.5280 
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 1,
        title: "Task 2: Chula -> Yaowarat (Chinatown) / ภารกิจที่ 2: จุฬาฯ → เยาวราช (ไชน่าทาวน์)",
        startTime: "15:00",
        description: `
Current Time: 15:00
Scenario: You are meeting friends for street food in Chinatown. They are already waiting, so you need to hurry, but you don't want to spend too much.
Constraints:
1. Duration must be UNDER 30 mins.
2. Choose the CHEAPEST route within the time limit.

---
เวลาปัจจุบัน: 15:00 น.
สถานการณ์: คุณมีนัดทานสตรีทฟู้ดกับเพื่อนที่เยาวราช เพื่อน ๆ กำลังรออยู่ จึงต้องรีบไปให้ทัน แต่ก็ไม่อยากเสียค่าเดินทางแพงเกินไป
เงื่อนไข:
1. ใช้เวลาเดินทาง น้อยกว่า 30 นาที
2. เลือกเส้นทางที่ ถูกที่สุด ภายในเวลาที่กำหนด
        `,
        origin: { lat: 13.7384, lng: 100.5315, name: "Chulalongkorn Univ." },
        dest:   { lat: 13.7410, lng: 100.5085, name: "Yaowarat chinatown" },

        grab: [
            { type: "JustGrab", cost: "THB 120", time: "", wait: "5 min" },
            { type: "GrabBike", cost: "THB 60", time: "", wait: "3 min" }
        ],
        bolt: [
            { type: "Bolt", cost: "THB 100", time: "", wait: "7 min" },
            { type: "Bolt Bike", cost: "THB 50", time: "", wait: "5 min" }
        ],
        google:{
            routes: [
                {
                    type: "car",
                    summary: "🚗 Car",
                    details: "Moderate traffic",
                    cost: "",
                    time: "20 min"
                },
                {
                    type: "transit",
                    summary: "🚍Bus 529/4-28",
                    details: "From 2 Kings Monument, 15:05",
                    cost: "THB 10",
                    time: "25 min",
                },
                {
                    type: "transit",
                    summary: "🚆MRT Blue",
                    details: "From Sam Yan St.",
                    cost: "THB 20",
                    time: "35 min"
                },
                {
                    type: "transit",
                    summary: "🚍Bus 37/4-9",
                    details: "From 2 Kings Monument, 15:10",
                    cost: "THB 10",
                    time: "35 min"
                },
                {
                    type: "walk",
                    summary: "🚶 Walk only",
                    details: "",
                    cost: "",
                    time: "50 min"
                }
            ],
        },

        moovit: {
            routes: [        
                {
                    summary: "🚍Bus 529/4-28",
                    details: "From 2 Kings Monument, 15:05",
                    cost: "THB 10",
                    time: "25 min",
                },
                {
                    summary: "🚆MRT Blue",
                    details: "From Sam Yan St.",
                    cost: "THB 20",
                    time: "35 min"
                },
                {
                    summary: "🚍Bus 25",
                    details: "From Chulalongkorn University, 15:15",
                    cost: "THB 10",
                    time: "30 min"
                }
            ],
        },
        viabus: {
            stops: [
                {
                    id: "stop_chula_2",
                    name: "Chulalongkorn University",
                    lat: 13.7385, lng: 100.52947,
                    lines: [
                        { 
                            number: "25", 
                            color: "#e17055", 
                            dest: "Tha Chang", 
                            wait: "25 min (Delayed)", 
                            busLat: 13.7420, busLng: 100.5330 // Farther away due to delay
                        }
                    ]
                },

                {
                    id: "2kings_1",
                    name: "Two Kings Monument", 
                    lat: 13.73814, lng: 100.52971,
                    lines: [
                        { 
                            number: "529/4-28", 
                            color: "#d63031", 
                            dest: "Samae Dam", 
                            wait: "30 min (Delayed)", 
                            busLat: 13.7600, busLng: 100.5150 // Very far
                        },
                        { 
                            number: "37/4-9", 
                            color: "#0984e3", 
                            dest: "Phra Pradaeng", 
                            wait: "12 min", 
                            busLat: 13.7520, busLng: 100.5110 
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 2,
        title: "Task 3: Chula -> Chatuchak Weekend Market / ภารกิจที่ 3: จุฬาฯ → ตลาดนัดจตุจักร",
        startTime: "18:00",
        description: `
Current Time: 18:00 (Rush Hour)
Scenario: You are going to Chatuchak Market for shopping. It is rush hour and traffic is very bad. You are tired and want to get there as soon as possible, regardless of the cost.
Constraints:
1. Choose the FASTEST route.
2. Cost is NOT a concern.

---
เวลาปัจจุบัน: 18:00 น. (ชั่วโมงเร่งด่วน)
สถานการณ์:
คุณกำลังจะไปช้อปปิ้งที่ตลาดนัดจตุจักร ขณะนี้เป็นช่วงเลิกงาน รถติดมาก คุณรู้สึกเหนื่อยและต้องการไปถึงให้เร็วที่สุด โดยไม่สนใจค่าใช้จ่าย
เงื่อนไข:
1. เลือกเส้นทางที่ เร็วที่สุด
2. ไม่จำกัดงบประมาณ
        `,
        origin: { lat: 13.7384, lng: 100.5315, name: "Chulalongkorn Univ." },
        dest:   { lat: 13.8030, lng: 100.5528, name: "Chatuchak Market" },

        grab: [
            { type: "JustGrab", cost: "THB 300", time: "", wait: "15 min" },
            { type: "GrabBike", cost: "THB 200", time: "", wait: "5 min" }
        ],
        bolt: [
            { type: "Bolt", cost: "THB 200", time: "", wait: "10 min" },
            { type: "Bolt Bike", cost: "THB 140", time: "", wait: "10 min" }
        ],
        google: {
            routes:[
                {
                    type: "car",
                    summary: "🚗 Car",
                    details: "Heavy traffic",
                    cost: "",
                    time: "50 min"
                },
                {
                    type: "transit",
                    summary: "🚝BTS Sukhumvit",
                    details: "From Siam St.",
                    cost: "THB 47",
                    time: "45 min"
                },
                {
                    type: "transit",
                    summary: "🚆MRT Blue",
                    details: "From Sam Yan St.",
                    cost: "THB 45",
                    time: "55 min"
                },
                {
                    type: "transit",
                    summary: "🚍Bus 29/1-1",
                    details: "From Chula Residence, 18:20",
                    cost: "THB 15",
                    time: "60 min"
                },
                {
                    type: "walk",
                    summary: "🚶 Walk only",
                    cost: "",
                    time: "120 min"
                }
            ],
        },
        moovit: {
            routes: [
                {
                    summary: "🚝BTS Sukhumvit",
                    details: "From Siam St.",
                    cost: "THB 47",
                    time: "45 min"
                },
                {
                    summary: "🚆MRT Blue",
                    details: "From Sam Yan St.",
                    cost: "THB 45",
                    time: "55 min"
                },
                {
                    summary: "🚍Bus 34",
                    details: "From Faculty of Education, 18:08",
                    cost: "THB 15",
                    time: "60 min",
                }
            ],
        },
        viabus: {
            stops: [
                {
                    id: "stop_edu_3",
                    name: "Faculty of Education",
                    lat: 13.73805, lng: 100.52943,
                    lines: [
                        { 
                            number: "34", 
                            color: "#e17055", 
                            dest: "Bang Khen", 
                            wait: "20 min (Delayed)", 
                            busLat: 13.7330, busLng: 100.5270 
                        }
                    ]
                },
                {
                    id: "stop_residence_3",
                    name: "Chulalongkorn uni. Residence",
                    lat: 13.7411, lng: 100.52983,
                    lines: [
                        { 
                            number: "29/1-1", 
                            color: "#0984e3", 
                            dest: "Bang Khen", 
                            wait: "15 min", 
                            busLat: 13.7310, busLng: 100.5250 
                        }
                    ]
                },
            ]
        }
    }
];