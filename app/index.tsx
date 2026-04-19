import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { db } from "../db";



export default function HomeScreen() {

  const seedFoodItems = () => {
    const existing = db.getAllSync("SELECT COUNT(*) as count FROM food_items");
    const count = existing?.[0]?.count ?? 0;

    if (count > 0) return;

    const now = new Date().toISOString();

    const seedData = [
      ["Chicken Breast", 31, 0, 3.6, "100g", 100],
      ["Rice (cooked)", 2.7, 28, 0.3, "100g", 100],
      ["Egg Whole", 13, 1.1, 11, "1 piece", 50],
      ["Oats", 13, 66, 7, "100g", 100],
      ["Salmon", 20, 0, 13, "100g", 100],
      ["Greek Yogurt", 10, 4, 0.4, "100g", 100],
      ["Banana", 1.1, 23, 0.3, "1 piece", 120],
      ["Olive Oil", 0, 0, 100, "1 tbsp", 10],
    ];

    seedData.forEach((item) => {
      db.runSync(
    `INSERT INTO food_items 
    (food_name, protein, carbohydrates, fat, unit, amount, createdAt, updatedAt, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item[0],
      item[1],
      item[2],
      item[3],
      item[4],
      item[5],
      now,
      now,
      ""
    ]
      );
    });
  };



  const [fooditems, setFooditems] = useState([]);
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [carbohydrates, setCarbohydrates] = useState("");
  const [fat, setFat] = useState("");
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState("");
  const [foodPlan, setFoodPlan] = useState([]);
  const [amountMap, setAmountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    seedFoodItems();

    const data = db.getAllSync("SELECT * FROM food_items");
    setFooditems(data);
  }, []);

  const planTotals = foodPlan.reduce((acc, item) => {
    const food = fooditems.find(f => f.id === item.food_item_id);

    if (!food) return acc;

    const factor = item.planned_amount / 100;

    return {
      protein: acc.protein + food.protein * factor,
      carbohydrates: acc.carbohydrates + food.carbohydrates * factor,
      fat: acc.fat + food.fat * factor,
    };
  }, {
    protein: 0,
    carbohydrates: 0,
    fat: 0
  });








  const loadPlan = () => {
    const data = db.getAllSync("SELECT * FROM food_plan ORDER BY date DESC");
    setFoodPlan(data);
    setMode("list_plan");
  };
  const [aboutText, setAboutText] = useState("");

  // UI
  const [mode, setMode] = useState("food_list");

  // DATA
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  const updateAmount = (id, delta, baseAmount) => {
    setAmountMap((prev) => {
      const current = prev[id] ?? baseAmount;
      return {
        ...prev,
        [id]: Math.max(0, current + delta)
      };
    });
  };

  // FORM
  const [foodForm, setFoodForm] = useState({
    name: "",
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    unit: "100g",
    amount: 100,
    notes: ""
  });

  // CALENDAR (future)
  const [calendar, setCalendar] = useState([]);
  const [calendarForm, setCalendarForm] = useState({
    day: "Monday",
    hour: "08:00",
    week: 1,
    month: 1,
    year: 2026,
    dose: ""
  });

  // SYSTEM
  const [dataMode, setDataMode] = useState("food");
  const [isLoading, setIsLoading] = useState(false);
  // "food" | "calendar"
  const TUTORIAL_TEXT =
    "Quick guide:\n\n" +
    "1. Add Food Item\n" +
    "2. Open List\n" +
    "3. Press 'Add to Calendar'\n" +
    "4. Fill Day / Hour / Dose\n" +
    "5. Save\n\n" +
    "Calendar:\n" +
    "- Tap 'Taken' to mark done\n" +
    "- Use Delete to remove\n";

  const ABOUT_TEXT =
    "Food calculator (Food & Supplement Tracker)\n\n" +

    "Purpose:\n" +
    "A simple mobile tool for tracking daily food and supplement intake.\n\n" +

    "What you can do:\n" +
    "- Add food items with basic nutrition values\n" +
    "- View your saved items quickly\n" +
    "- Prepare future calendar tracking (coming next)\n\n" +

    "Design idea:\n" +
    "Fast, minimal and offline-first usage.\n" +
    "No accounts, no cloud, no distractions.\n\n" +

    "Status:\n" +
    "Early MVP – core features are working.\n\n" +

    "Author:\n" +
    "Raimo P.";

  // "food_list" | "food_add" | "food_detail" | "calendar"

  const loadFoodItems = () => {
    const data = db.getAllSync(
      "SELECT * FROM food_items ORDER BY food_name COLLATE NOCASE ASC"
    );
    setFooditems(data);
    setMode("list");
  };

  const addFoodItem = () => {
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO food_items 
    (food_name, protein, carbohydrates, fat, unit, amount, createdAt, updatedAt, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        Number(protein),
        Number(carbohydrates),
        Number(fat),
        unit,
        Number(amount),
        now,
        now,
        ""
      ]
    );

    setName("");
    setProtein("");
    setCarbohydrates("");
    setFat("");
    setUnit("");
    setAmount("");

    loadFoodItems();
  };

  const deletePlanItem = (id) => {
    db.runSync("DELETE FROM food_plan WHERE id = ?", [id]);

    const data = db.getAllSync("SELECT * FROM food_plan ORDER BY date DESC");
    setFoodPlan(data);
  };

  const addToPlan = (item) => {
    const now = new Date().toISOString();

    const finalAmount =
      amountMap[item.id] ?? item.amount;

    db.runSync(
      `INSERT INTO food_plan 
    (food_item_id, planned_amount, unit, date, createdAt, updatedAt, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        finalAmount,
        item.unit,
        now,
        now,
        now,
        item.food_name
      ]
    );

    const data = db.getAllSync("SELECT * FROM food_plan ORDER BY date DESC");
    setFoodPlan(data);

    setMode("list_plan");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>

      {/* ROW 1 */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <Pressable
          onPress={() => setMode("add")}
          style={{ flex: 1, backgroundColor: "#2563eb", padding: 15 }}
        >
          <Text style={{ color: "white" }}>Add Food Item</Text>
        </Pressable>

        <Pressable
          onPress={loadFoodItems}
          style={{ flex: 1, backgroundColor: "#2563eb", padding: 15 }}
        >
          <Text style={{ color: "white" }}>List Food Items</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            seedFoodItems();

            const data = db.getAllSync("SELECT * FROM food_items");
            setFooditems(data);
          }}
          style={{ flex: 1, backgroundColor: "#f59e0b", padding: 15 }}
        >
          <Text style={{ color: "white" }}>Seed Data</Text>
        </Pressable>
      </View>

      {/* ROW 2 */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <Pressable
          onPress={loadPlan}
          style={{ flex: 1, backgroundColor: "#1d4ed8", padding: 15 }}
        >
          <Text style={{ color: "white" }}>Plan</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("about")}
          style={{ flex: 1, backgroundColor: "#1d4ed8", padding: 15 }}
        >
          <Text style={{ color: "white" }}>About</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            db.runSync("DELETE FROM food_items");

            seedFoodItems();

            const data = db.getAllSync("SELECT * FROM food_items");
            setFooditems(data);
          }}
          style={{ flex: 1, backgroundColor: "#ef4444", padding: 15 }}
        >
          <Text style={{ color: "white" }}>Reset + Seed</Text>
        </Pressable>
      </View>

      {/* ROW 3 */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>




      </View>


      {/* CONTENT */}
      <View style={{ flex: 1 }}>

 {mode === "add" && (
  <ScrollView>
    <View
      style={{
        backgroundColor: "#111827",
        padding: 16,
        borderRadius: 10
      }}
    >
      <Text style={{ color: "white", marginBottom: 5 }}>Food name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      />

      <Text style={{ color: "white", marginBottom: 5 }}>Protein</Text>
      <TextInput
        value={protein}
        onChangeText={setProtein}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      />

      <Text style={{ color: "white", marginBottom: 5 }}>Carbohydrates</Text>
      <TextInput
        value={carbohydrates}
        onChangeText={setCarbohydrates}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      />

      <Text style={{ color: "white", marginBottom: 5 }}>Fat</Text>
      <TextInput
        value={fat}
        onChangeText={setFat}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      />

      <Text style={{ color: "white", marginBottom: 5 }}>Unit</Text>
      <TextInput
        value={unit}
        onChangeText={setUnit}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      />

      <Text style={{ color: "white", marginBottom: 5 }}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      />

      <Pressable
        onPress={addFoodItem}
        style={{
          backgroundColor: "#22c55e",
          padding: 12,
          borderRadius: 6,
          marginTop: 10
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Save
        </Text>
      </Pressable>
    </View>
  </ScrollView>
)}

        {mode === "list" && (
          <ScrollView>
            {fooditems.map((item) => (
              <View
                key={item.id}
                style={{
                  padding: 12,
                  backgroundColor: "#1f2937",
                  marginBottom: 10
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>
                  {item.food_name}
                </Text>

                <Text style={{ color: "#aaa" }}>
                  Protein: {item.protein}
                </Text>

                <Text style={{ color: "#aaa" }}>
                  Carbohydrates: {item.carbohydrates}
                </Text>

                <Text style={{ color: "#aaa" }}>
                  Fat: {item.fat}
                </Text>

                <Text style={{ color: "#aaa" }}>
                  Unit: {item.unit}
                </Text>

                <Text style={{ color: "#aaa" }}>
                  Amount: {item.amount}
                </Text>
                <TextInput
                  value={amountMap[item.id]?.toString() || String(item.amount)}
                  onChangeText={(t) =>
                    setAmountMap({
                      ...amountMap,
                      [item.id]: Number(t)
                    })
                  }
                  style={{
                    backgroundColor: "white",
                    padding: 6,
                    marginTop: 8
                  }}
                />

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>

                  <Pressable
                    onPress={() => updateAmount(item.id, -10, item.amount)}
                    onLongPress={() => updateAmount(item.id, -50, item.amount)}
                    delayLongPress={400}
                    style={{ backgroundColor: "#ef4444", padding: 8 }}
                  >
                    <Text style={{ color: "white" }}>-10</Text>
                  </Pressable>

                  <Text style={{ color: "white", marginHorizontal: 10 }}>
                    {amountMap[item.id] ?? item.amount}g
                  </Text>

                  <Pressable
                    onPress={() => updateAmount(item.id, 10, item.amount)}
                    onLongPress={() => updateAmount(item.id, 50, item.amount)}
                    delayLongPress={400}
                    style={{ backgroundColor: "#22c55e", padding: 8 }}
                  >
                    <Text style={{ color: "white" }}>+10</Text>
                  </Pressable>

                </View>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>

                  <Pressable
                    onPress={() => addToPlan(item)}
                    style={{ backgroundColor: "green", padding: 8, flex: 1 }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      Add to Plan
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      db.runSync("DELETE FROM food_items WHERE id = ?", [item.id]);
                      loadFoodItems();
                    }}
                    style={{ backgroundColor: "#dc2626", padding: 8, flex: 1 }}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      Delete
                    </Text>
                  </Pressable>

                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {mode === "addCalendar" && (
          <View>

            <Text style={{ marginBottom: 5 }}>Date</Text>
            <TextInput
              value={calendarForm.date}
              onChangeText={(t) =>
                setCalendarForm({ ...calendarForm, date: t })
              }
              placeholder="2026-04-18"
              style={{ backgroundColor: "white", marginBottom: 10 }}
            />

            <Text style={{ marginBottom: 5 }}>Amount</Text>
            <TextInput
              value={String(calendarForm.amount || "")}
              onChangeText={(t) =>
                setCalendarForm({
                  ...calendarForm,
                  amount: Number(t)
                })
              }
              style={{ backgroundColor: "white", marginBottom: 10 }}
            />

            <Text style={{ marginBottom: 5 }}>Notes</Text>
            <TextInput
              value={calendarForm.notes}
              onChangeText={(t) =>
                setCalendarForm({ ...calendarForm, notes: t })
              }
              style={{ backgroundColor: "white", marginBottom: 10 }}
            />

            <Pressable
              onPress={() => console.log("SAVE FOOD PLAN:", calendarForm)}
              style={{ backgroundColor: "green", padding: 12 }}
            >
              <Text style={{ color: "white" }}>Save</Text>
            </Pressable>

          </View>
        )}


        {mode === "about" && (
          <ScrollView>
            <View
              style={{
                backgroundColor: "#111827",
                padding: 16,
                borderRadius: 10
              }}
            >
              <Text style={{ color: "white", fontSize: 16, lineHeight: 22 }}>
                {ABOUT_TEXT}
              </Text>
            </View>
          </ScrollView>
        )}
        {mode === "tutorial" && (
          <ScrollView>
            <Text style={{ color: "black", fontSize: 16 }}>
              {TUTORIAL_TEXT}
            </Text>
          </ScrollView>
        )}
        {mode === "list_plan" && (
          <ScrollView>
            {foodPlan.map((item) => (
              <View
                key={item.id}
                style={{
                  padding: 12,
                  backgroundColor: "#1f2937",
                  marginBottom: 10
                }}
              >
                <Text style={{ color: "white" }}>
                  Food ID: {item.food_item_id}
                </Text>

                <Text style={{ color: "white" }}>
                  Amount: {item.planned_amount}
                </Text>

                <Text style={{ color: "white" }}>
                  Date: {item.date}
                </Text>

                <Text style={{ color: "#aaa" }}>
                  Notes: {item.notes}
                </Text>
                <Pressable
                  onPress={() => deletePlanItem(item.id)}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#dc2626",
                    padding: 8
                  }}
                >
                  <Text style={{ color: "white" }}>Delete</Text>
                </Pressable>

              </View>



            ))}

            <View
              style={{
                marginTop: 20,
                padding: 12,
                backgroundColor: "#111827",
                borderRadius: 8
              }}
            >
              <Text style={{ color: "white", fontSize: 16, marginBottom: 6 }}>
                Daily Summary
              </Text>

              <Text style={{ color: "#fff" }}>
                Protein: {planTotals.protein.toFixed(1)} g
              </Text>

              <Text style={{ color: "#fff" }}>
                Carbs: {planTotals.carbohydrates.toFixed(1)} g
              </Text>

              <Text style={{ color: "#fff" }}>
                Fat: {planTotals.fat.toFixed(1)} g
              </Text>
            </View>
          </ScrollView>
        )}


      </View>
    </View>
  );
}