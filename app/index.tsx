import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { db, getSupplements } from "../db";

export default function HomeScreen() {
  const [supplements, setSupplements] = useState([]);
  const [aboutText, setAboutText] = useState("");
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [dose, setDose] = useState("");
  const [mode, setMode] = useState("list");
  const [calendar, setCalendar] = useState([]);

  const [calendarItem, setCalendarItem] = useState(null);
  const [calendarHour, setCalendarHour] = useState("08:00");
  const [calendarDay, setCalendarDay] = useState("Monday");

  const [calendarWeek, setCalendarWeek] = useState(1);
  const [calendarMonth, setCalendarMonth] = useState(1);
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarDose, setCalendarDose] = useState("");
  const TUTORIAL_TEXT =
    "Quick guide:\n\n" +
    "1. Add Supplement\n" +
    "2. Open List\n" +
    "3. Press 'Add to Calendar'\n" +
    "4. Fill Day / Hour / Dose\n" +
    "5. Save\n\n" +
    "Calendar:\n" +
    "- Tap 'Taken' to mark done\n" +
    "- Use Delete to remove\n";

  const toggleTaken = (item) => {
    const newValue = item.taken === 1 ? 0 : 1;

    console.log("TOGGLE ITEM:", item);

    db.runSync(
      "UPDATE supplement_calendar SET taken = ?, updatedAt = ? WHERE id = ?",
      [newValue, new Date().toISOString(), item.id]
    );

    loadCalendar();
  };

  const deleteCalendarItem = (id) => {
    try {
      db.runSync(
        "DELETE FROM supplement_calendar WHERE id = ?",
        [id]
      );

      loadCalendar(); // päivitys UI:hin
    } catch (error) {
      console.log("DELETE CALENDAR ERROR:", error);
    }
  };


  const ABOUT_TEXT =
    "Food supplement controller.\n\n" +
    "This application helps you plan and track your supplements.\n\n" +
    "Features:\n" +
    "- Supplement information (wiki-style reference)\n" +
    "- Calendar-based planning\n" +
    "- Confirm taken supplements tracking\n\n" +
    "Purpose:\n" +
    "Simple local record of supplement usage and consistency.\n\n" +
    "Developed by Raimo P.";

  const loadCalendar = () => {
    try {
      const data = db.getAllSync(
        `SELECT *,
  (year * 10000 + month * 100 + week_number) as sortKey
  FROM supplement_calendar
  ORDER BY sortKey ASC, hour ASC`
      );
      console.log("CALENDAR RAW DATA:", data); // 🔥 tärkeä debug

      setCalendar(data);
      setMode("calendar");

    } catch (error) {
      console.log("LOAD CALENDAR ERROR:", error);
    }
  };
  const deleteSupplement = (id) => {
    try {
      db.runSync("DELETE FROM supplement_name WHERE id = ?", [id]);
      const data = db.getAllSync("SELECT * FROM supplement_name");
      setSupplements(data);
    } catch (error) {
      console.log("DELETE ERROR:", error);
    }
  };

  const addSupplementToDB = () => {
    const createdAt = new Date().toISOString();

    try {
      db.runSync(
        `INSERT INTO supplement_name 
        (SUPPLEMENT_NAME, PURPOSE, DOSE, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)`,
        [name, purpose, dose, createdAt, createdAt]
      );

      setName("");
      setPurpose("");
      setDose("");

      const data = db.getAllSync("SELECT * FROM supplement_name");
      setSupplements(data);
      setMode("list");
    } catch (error) {
      console.log("INSERT ERROR:", error);
    }
  };

  const loadSupplements = () => {
    setAboutText("");
    setMode("list");

    getSupplements((data) => {
      setSupplements(data);
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>

      {/* BUTTON AREA */}
      <View style={{ flex: 3, justifyContent: "center" }}>

        {/* ROW 1 */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <Pressable
            onPress={() => {
              setSupplements([]);
              setAboutText("");
              setMode("add");
            }}
            style={{ flex: 1, backgroundColor: "#2e6ef7", padding: 20 }}
          >
            <Text style={{ color: "white" }}>Add Supplement</Text>
          </Pressable>

          <Pressable
            onPress={loadSupplements}
            style={{ flex: 1, backgroundColor: "#2e6ef7", padding: 20 }}
          >
            <Text style={{ color: "white" }}>List Supplements</Text>
          </Pressable>
        </View>

        {/* ROW 2 */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <Pressable
            onPress={loadCalendar}
            style={{ flex: 1, backgroundColor: "#2e6ef7", padding: 20 }}
          >
            <Text style={{ color: "white" }}>Calendar</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode("about");
              setAboutText(ABOUT_TEXT);
            }}
            style={{ flex: 1, backgroundColor: "#2e6ef7", padding: 20 }}
          >
            <Text style={{ color: "white" }}>About</Text>
          </Pressable>
        </View>

        {/* ROW 3 */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => setMode("addCalendar")}
            style={{ flex: 1, backgroundColor: "#2e6ef7", padding: 20 }}
          >
            <Text style={{ color: "white" }}>Add to Calendar</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setMode("about");
              setAboutText(TUTORIAL_TEXT);
            }}
            style={{ flex: 1, backgroundColor: "#2e6ef7", padding: 20 }}
          >
            <Text style={{ color: "white" }}>Tutorial</Text>
          </Pressable>
        </View>

      </View>

      {/* CONTENT */}
      <View style={{
        flex: 4,
        marginTop: 10,
        backgroundColor: "#111827",
        borderRadius: 10,
        padding: 15
      }}>

        <Text style={{ color: "white", marginBottom: 10, fontSize: 16 }}>
          {mode === "add"
            ? "Add Supplement"
            : mode === "about"
              ? "Info"
              : mode === "calendar"
                ? "Calendar"
                : mode === "addCalendar"
                  ? "Add to Calendar"
                  : "Supplements"}
        </Text>

        <ScrollView>

          {/* ABOUT */}
          {mode === "about" && (
            <View style={{ backgroundColor: "#374151", padding: 12, borderRadius: 8 }}>
              <Text style={{ color: "white" }}>{aboutText}</Text>
            </View>
          )}

          {/* ADD */}
          {mode === "add" && (
            <View>
              <Text style={{ color: "white" }}>Name</Text>
              <TextInput value={name} onChangeText={setName} style={{ backgroundColor: "white", marginBottom: 10 }} />

              <Text style={{ color: "white" }}>Purpose</Text>
              <TextInput value={purpose} onChangeText={setPurpose} style={{ backgroundColor: "white", marginBottom: 10 }} />

              <Text style={{ color: "white" }}>Dose</Text>
              <TextInput value={dose} onChangeText={setDose} style={{ backgroundColor: "white", marginBottom: 10 }} />

              <Pressable onPress={addSupplementToDB} style={{ backgroundColor: "green", padding: 12 }}>
                <Text style={{ color: "white" }}>Save</Text>
              </Pressable>
            </View>
          )}

          {/* LIST */}
          {mode === "list" && supplements.map((item) => (
            <View key={item.id} style={{
              backgroundColor: "#1f2937",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10
            }}>
              <Text style={{ color: "white", fontSize: 16 }}>
                {item.SUPPLEMENT_NAME}
              </Text>

              <Text style={{ color: "#9CA3AF" }}>{item.PURPOSE}</Text>
              <Text style={{ color: "#9CA3AF" }}>Dose: {item.DOSE || "-"}</Text>

              <Pressable
                onPress={() => {
                  setCalendarItem(item);
                  setMode("addCalendar");
                }}
                style={{ marginTop: 10, backgroundColor: "#1d4ed8", padding: 8, borderRadius: 6 }}
              >
                <Text style={{ color: "white" }}>Add to Calendar</Text>
              </Pressable>

              <Pressable
                onPress={() => deleteSupplement(item.id)}
                style={{ marginTop: 10, backgroundColor: "#b91c1c", padding: 8, borderRadius: 6 }}
              >
                <Text style={{ color: "white" }}>Delete</Text>
              </Pressable>
            </View>
          ))}

          {/* ADD CALENDAR */}
          {mode === "addCalendar" && (
            <View>

              <Text style={{ color: "white" }}>
                Supplement: {calendarItem?.SUPPLEMENT_NAME}
              </Text>

              <Text style={{ color: "white" }}>Day</Text>
              <TextInput
                value={calendarDay}
                onChangeText={setCalendarDay}
                style={{ backgroundColor: "white", marginBottom: 10 }}
              />

              <Text style={{ color: "white" }}>Hour</Text>
              <TextInput
                value={calendarHour}
                onChangeText={setCalendarHour}
                style={{ backgroundColor: "white", marginBottom: 10 }}
              />

              <Text style={{ color: "white" }}>Week</Text>
              <TextInput
                value={String(calendarWeek)}
                onChangeText={(t) => setCalendarWeek(Number(t))}
                style={{ backgroundColor: "white", marginBottom: 10 }}
              />

              <Text style={{ color: "white" }}>Month</Text>
              <TextInput
                value={String(calendarMonth)}
                onChangeText={(t) => setCalendarMonth(Number(t))}
                style={{ backgroundColor: "white", marginBottom: 10 }}
              />

              <Text style={{ color: "white" }}>Year</Text>
              <TextInput
                value={String(calendarYear)}
                onChangeText={(t) => setCalendarYear(Number(t))}
                style={{ backgroundColor: "white", marginBottom: 10 }}
              />

              <Text style={{ color: "white" }}>Dose</Text>
              <TextInput
                value={calendarDose}
                onChangeText={setCalendarDose}
                style={{ backgroundColor: "white", marginBottom: 10 }}
              />

              <Pressable
                onPress={() => {
                  if (!calendarItem) return;

                  const now = new Date().toISOString();
                  const year = new Date().getFullYear();

                  db.runSync(
                    `INSERT INTO supplement_calendar
          (supplement_id, SUPPLEMENT_NAME, day, hour, week_number, month, year, dose, taken, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
                    [
                      calendarItem.id,
                      calendarItem.SUPPLEMENT_NAME,
                      calendarDay,
                      calendarHour,
                      calendarWeek,
                      calendarMonth,
                      calendarYear,
                      calendarDose,
                      now,
                      now
                    ]
                  );

                  loadCalendar();
                  setMode("calendar");
                }}
                style={{
                  backgroundColor: "green",
                  padding: 12,
                  marginTop: 10
                }}
              >
                <Text style={{ color: "white" }}>Save to Calendar</Text>
              </Pressable>

            </View>
          )}

          {/* CALENDAR */}
          {mode === "calendar" && calendar.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#1f2937",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10
              }}
            >
              <Text style={{ color: "white" }}>
                SupplementName: {item.SUPPLEMENT_NAME}
              </Text>

              <Text style={{ color: "white" }}>
                Hour: {item.hour}
              </Text>

              <Text style={{ color: "white" }}>
                Id: {item.id}
              </Text>

              <Text style={{ color: "white" }}>
                Day: {item.day}
              </Text>

              <Text style={{ color: "white" }}>
                W_number: {item.week_number}
              </Text>

              <Text style={{ color: "white" }}>
                Month: {item.month || "-"}
              </Text>

              <Text style={{ color: "white" }}>
                Year: {item.year || 2026}
              </Text>

              <Text style={{ color: "#9CA3AF" }}>
                Created At: {item.createdAt}
              </Text>

              <Text style={{ color: "#9CA3AF" }}>
                Updated At: {item.updatedAt}
              </Text>

              <Text style={{ color: "white" }}>
                Dose: {item.dose || "-"}
              </Text>

              <Text style={{ color: "white" }}>
                Taken: {item.taken ? "Yes" : "Not"}
              </Text>

              <Pressable
                onPress={() => toggleTaken(item)}
                style={{
                  marginTop: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  backgroundColor: item.taken === 1 ? "#14532d" : "#374151",
                  borderRadius: 6,
                  alignSelf: "flex-start"
                }}
              >
                <Text style={{ color: "white" }}>
                  Taken: {item.taken === 1 ? "YES" : "NOT"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => deleteCalendarItem(item.id)}
              >
                <Text style={{ color: "red" }}>Delete this</Text>
              </Pressable>
            </View>
          ))}

        </ScrollView>
      </View>

      {/* BOTTOM */}
      <View style={{ flex: 3, justifyContent: "center", alignItems: "center" }}>
        <Text>DosoSupli</Text>
      </View>

    </View>
  );
}