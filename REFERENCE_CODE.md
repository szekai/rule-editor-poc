# Reference Code - Original Draft

This file contains the original example code provided by the user for reference.

## SpelRuleEditor.js (Original)

```javascript
import { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { parse } from "spel2js";
import { Card, CardContent, Button, Input } from "@mui/material";
// import { toast } from "react-toastify";

export default function SpelRuleEditor() {
  const [selectedRule, setSelectedRule] = useState(null);
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    condition: "",
    ruleType: "validation",
    errorCode: "",
  });

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => setRules(data))
      .catch((err) => console.error("Error loading rules:", err));
  }, []);

  // const validateSpEL = (expression) => {
  //   try {
  //     parse(expression);
  //     setError("");
  //     return true;
  //   } catch (err) {
  //     setError("Invalid SpEL Expression!");
  //     return false;
  //   }
  // };

  const handleSave = async () => {
    // const response = await fetch("/api/spel/validate", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ spelExpression: newRule.condition })
    // });
    // const result = await response.json();
    // if (!result.valid) {
    //   toast.error("Invalid SpEL Expression");
    //   return;
    // }

    setRules([...rules, newRule]);
    // toast.success("Rule saved successfully!");
    setNewRule({
      name: "",
      description: "",
      condition: "",
      ruleType: "validation",
      errorCode: "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">SpEL Rule Editor</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 border rounded p-4 space-y-2">
          <h2 className="text-lg font-semibold">Rules List</h2>
          {rules.map((rule, index) => (
            <Card
              key={index}
              onClick={() => setSelectedRule(rule)}
              style={{ border: "1px solid grey", margin: "10px" }}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              <CardContent>
                <p className="font-medium">{rule.name}</p>
                <p className="text-sm text-gray-500">{rule.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="col-span-2 border rounded p-4">
          <h2 className="text-lg font-semibold">Edit Rule</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
              marginBottom: "1em",
            }}
          >
            <Input
              placeholder="Rule Name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newRule.description}
              onChange={(e) =>
                setNewRule({ ...newRule, description: e.target.value })
              }
            />
            <Input
              placeholder="Error Code"
              value={newRule.errorCode}
              onChange={(e) =>
                setNewRule({ ...newRule, errorCode: e.target.value })
              }
            />
          </div>
          <MonacoEditor
            height="200px"
            language="javascript"
            value={newRule.condition}
            onChange={(value) => setNewRule({ ...newRule, condition: value })}
          />
          <Button variant="outlined" onClick={handleSave} className="mt-4">
            Save Rule
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## RuleSetEditor.js (Original)

```javascript
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@mui/material";

const ItemType = {
  RULE: "rule",
  RULE_SET: "rule_set",
};

// --------- API ---------
const fetchRules = async () => {
  return [
    { id: 1, name: "Rule 1", type: "rule" },
    { id: 2, name: "Rule 2", type: "rule" },
    { id: 3, name: "Rule 3", type: "rule" },
    { id: 4, name: "Rule 4", type: "rule" },
    { id: 5, name: "Rule 5", type: "rule" },
  ];
};

const fetchRuleSets = async () => {
  return [
    { id: 1, name: "Set 1", type: "rule_set" },
    { id: 2, name: "Set 2", type: "rule_set" },
    { id: 3, name: "Set 3", type: "rule_set" },
    { id: 4, name: "Set 4", type: "rule_set" },
    { id: 5, name: "Set 5", type: "rule_set" },
  ];
};

const saveRuleSet = async (newRuleSet) => {
  console.log("saveRuleSet: ", newRuleSet);
};

// --------- Elements ---------
const DraggableItem = ({ item, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        backgroundColor: `${type === ItemType.RULE ? "aliceblue" : "khaki"} 
        ${isDragging ? "opacity-50" : ""}`,
        margin: "5px",
        width: "25%",
        height: "25%",
        padding: "1em",
      }}
    >
      {item.name}
    </div>
  );
};

const DropZone = ({ onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemType.RULE, ItemType.RULE_SET],
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        border: "1px solid black",
        borderRadius: "15px",
        borderStyle: "dashed",
      }}
    >
      {children}
    </div>
  );
};

const RuleSetEditor = () => {
  const queryClient = useQueryClient();
  const { data: rules = [] } = useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
  });
  const { data: ruleSets = [] } = useQuery({
    queryKey: ["ruleSets"],
    queryFn: fetchRuleSets,
  });
  const [newRuleSet, setNewRuleSet] = useState([]);
  const mutation = useMutation({
    mutationFn: saveRuleSet,
    onSuccess: () => queryClient.invalidateQueries("ruleSets"),
  });

  const handleDrop = (item) => {
    setNewRuleSet((prev) => [...prev, item]);
  };

  const handleRemove = (index) => {
    setNewRuleSet((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSave = () => {
    if (newRuleSet.length > 0) {
      mutation.mutate({ name: "New Rule Set", rules: newRuleSet });
      setNewRuleSet([]);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ marginBottom: "2em" }}>
        <h2>Create a New Rule Set</h2>
        <div>
          <div>
            <h3>Available Rules</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                flexGrow: "1",
              }}
            >
              {rules.map((rule) => (
                <DraggableItem key={rule.id} item={rule} type={ItemType.RULE} />
              ))}
            </div>
            <h3>Existing Rule Sets</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                flexGrow: "1",
              }}
            >
              {ruleSets.map((set) => (
                <DraggableItem
                  key={set.id}
                  item={set}
                  type={ItemType.RULE_SET}
                />
              ))}
            </div>
          </div>
          <div>
            <h3>New Rule Set</h3>
            <DropZone onDrop={handleDrop}>
              {newRuleSet.length > 0 ? (
                newRuleSet.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: `${
                        item.type === ItemType.RULE ? "aliceblue" : "khaki"
                      }`,
                      width: "25%",
                      height: "25%",
                      padding: "1em",
                    }}
                  >
                    {item.name}
                    <Button
                      variant="outlined"
                      onClick={() => handleRemove(index)}
                    >
                      x
                    </Button>
                  </div>
                ))
              ) : (
                <p>Drag rules here</p>
              )}
            </DropZone>
            <Button
              variant="outlined"
              onClick={handleSave}
              style={{ marginTop: "1em" }}
            >
              Save Rule Set
            </Button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default RuleSetEditor;
```

## index.js (Original)

```javascript
import RuleSetEditor from "./RuleSetEditor";
import SpelRuleEditor from "./SpelRuleEditor";
import MakerCheckerTable from "./MakerChecker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card, CardContent } from "@mui/material";
const queryClient = new QueryClient();

function PocSK() {
  return (
    <QueryClientProvider client={queryClient}>
      <Card style={{ margin: "2em" }}>
        <CardContent>
          <RuleSetEditor />
        </CardContent>
      </Card>
      <Card style={{ margin: "2em" }}>
        <CardContent>
          <SpelRuleEditor />
        </CardContent>
      </Card>
      <Card style={{ margin: "2em" }}>
        <CardContent>
          <MakerCheckerTable />
        </CardContent>
      </Card>
    </QueryClientProvider>
  );
}

export default PocSK;
```
