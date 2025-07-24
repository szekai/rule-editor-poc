import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Button,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { mockApi } from "../utils/mockApi";

const ItemType = {
  RULE: "rule",
  RULE_SET: "rule_set",
};

// Draggable Item Component
const DraggableItem = ({
  item,
  type,
  onDelete,
  onViewDetails,
  source = "library",
  disabled = false,
  disabledReason = "",
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { ...item, sourceType: type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !disabled,
  }));

  const isRule = type === ItemType.RULE;

  return (
    <Card
      ref={disabled ? null : drag}
      sx={{
        m: 1,
        minWidth: 200,
        opacity: isDragging ? 0.5 : disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "grab",
        border: 1,
        borderColor: disabled
          ? "error.light"
          : isRule
          ? "primary.light"
          : "secondary.light",
        "&:hover": {
          borderColor: disabled
            ? "error.main"
            : isRule
            ? "primary.main"
            : "secondary.main",
          boxShadow: disabled ? 0 : 2,
        },
        filter: disabled ? "grayscale(0.5)" : "none",
      }}
      title={disabled ? disabledReason : ""}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DragIcon color="action" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="bold">
                {item.name}
              </Typography>
            </Box>
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {item.description}
              </Typography>
            )}
            <Box sx={{ mt: 1 }}>
              <Chip
                label={isRule ? item.ruleType || "Rule" : "Rule Set"}
                size="small"
                color={isRule ? "primary" : "secondary"}
                variant="outlined"
              />
              {item.errorCode && (
                <Chip
                  label={item.errorCode}
                  size="small"
                  sx={{ ml: 1 }}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {onViewDetails && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(item, type);
                }}
                color="info"
                title="View Details"
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && source === "composition" && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                color="error"
                title="Remove"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Drop Zone Component
const DropZone = ({ onDrop, children, isOver }) => {
  const [{ canDrop, isOverCurrent }, drop] = useDrop(() => ({
    accept: [ItemType.RULE, ItemType.RULE_SET],
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <Paper
      ref={drop}
      sx={{
        minHeight: 200,
        p: 2,
        border: 2,
        borderStyle: "dashed",
        borderColor: isOverCurrent && canDrop ? "primary.main" : "grey.400",
        backgroundColor: isOverCurrent && canDrop ? "primary.50" : "grey.50",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </Paper>
  );
};

const RuleSetEditor = () => {
  const queryClient = useQueryClient();
  const [newRuleSet, setNewRuleSet] = useState([]);
  const [ruleSetName, setRuleSetName] = useState("");
  const [ruleSetDescription, setRuleSetDescription] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [editingRuleSet, setEditingRuleSet] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Duplication dialog state
  const [duplicationDialog, setDuplicationDialog] = useState({
    open: false,
    title: "",
    message: "",
    duplicatedRules: [],
    nonDuplicatedRules: [],
    onConfirm: null,
    onCancel: null,
  });

  // Ref to track current composition to avoid stale closure
  const currentCompositionRef = useRef([]);

  // Update ref with current state
  useEffect(() => {
    currentCompositionRef.current = newRuleSet;
    console.log(
      "🔄 Ref updated with composition:",
      newRuleSet.map((i) => i.name)
    );
  }, [newRuleSet]);

  // Queries
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["rules"],
    queryFn: mockApi.getRules,
  });

  const { data: ruleSets = [], isLoading: ruleSetsLoading } = useQuery({
    queryKey: ["ruleSets"],
    queryFn: mockApi.getRuleSets,
  });

  // Mutations
  const createRuleSetMutation = useMutation({
    mutationFn: mockApi.createRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries(["ruleSets"]);
      showSnackbar("Rule set created successfully!");
      resetComposition();
      setSaveDialogOpen(false);
    },
    onError: (error) => {
      showSnackbar("Error creating rule set: " + error.message, "error");
    },
  });

  const updateRuleSetMutation = useMutation({
    mutationFn: ({ id, updates }) => mockApi.updateRuleSet(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["ruleSets"]);
      showSnackbar("Rule set updated successfully!");
      resetComposition();
      setSaveDialogOpen(false);
    },
    onError: (error) => {
      showSnackbar("Error updating rule set: " + error.message, "error");
    },
  });

  const deleteRuleSetMutation = useMutation({
    mutationFn: mockApi.deleteRuleSet,
    onSuccess: () => {
      queryClient.invalidateQueries(["ruleSets"]);
      showSnackbar("Rule set deleted successfully!");
    },
    onError: (error) => {
      showSnackbar("Error deleting rule set: " + error.message, "error");
    },
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Helper function to check if a rule set should be disabled (prevent cycles and duplicates)
  const isRuleSetDisabled = (ruleSet) => {
    // Check if already in composition
    const existsInComposition = newRuleSet.some(
      (item) => item.id === ruleSet.id && item.sourceType === ItemType.RULE_SET
    );

    if (existsInComposition) {
      const nonDuplicatedRules = findNonDuplicatedRules(ruleSet);
      const copyableCount = nonDuplicatedRules.length;
      return {
        disabled: true,
        reason:
          copyableCount > 0
            ? `Already in rule set (${copyableCount} rule${
                copyableCount !== 1 ? "s" : ""
              } can be copied)`
            : "Already in rule set",
      };
    }

    // Check if it's the rule set being edited (prevent self-inclusion)
    if (editingRuleSet && ruleSet.id === editingRuleSet.id) {
      const nonDuplicatedRules = findNonDuplicatedRules(ruleSet);
      const copyableCount = nonDuplicatedRules.length;
      return {
        disabled: true,
        reason:
          copyableCount > 0
            ? `Cannot add to itself (${copyableCount} rule${
                copyableCount !== 1 ? "s" : ""
              } can be copied)`
            : "Cannot add rule set to itself",
      };
    }

    // Check for cyclic dependencies
    if (
      editingRuleSet &&
      checkCyclicDependency(ruleSet.id, editingRuleSet.id)
    ) {
      const nonDuplicatedRules = findNonDuplicatedRules(ruleSet);
      const copyableCount = nonDuplicatedRules.length;
      return {
        disabled: true,
        reason:
          copyableCount > 0
            ? `Would create cycle (${copyableCount} rule${
                copyableCount !== 1 ? "s" : ""
              } can be copied)`
            : "Would create circular dependency",
      };
    }

    return { disabled: false, reason: "" };
  };

  // Helper function to check if a rule should be disabled (prevent duplicates)
  const isRuleDisabled = (rule) => {
    const existsInComposition = newRuleSet.some(
      (item) => item.id === rule.id && item.sourceType === ItemType.RULE
    );

    if (existsInComposition) {
      return { disabled: true, reason: "Already in rule set" };
    }

    return { disabled: false, reason: "" };
  };

  // Helper function to check for cyclic dependencies
  const checkCyclicDependency = (
    ruleSetId,
    targetRuleSetId,
    visitedIds = new Set()
  ) => {
    // If we've already visited this rule set, we found a cycle
    if (visitedIds.has(ruleSetId)) {
      return true;
    }

    // If this is the target rule set we're trying to add, it would create a cycle
    if (ruleSetId === targetRuleSetId) {
      return true;
    }

    // Add current rule set to visited set
    visitedIds.add(ruleSetId);

    // Find the rule set in our data
    const ruleSet = ruleSets.find((rs) => rs.id === ruleSetId);
    if (!ruleSet || !ruleSet.rules) {
      return false;
    }

    // Check all rule sets within this rule set
    for (const ruleItem of ruleSet.rules) {
      // Handle both old format (just ID) and new format (object with id, priority, reference)
      const ruleId = typeof ruleItem === "object" ? ruleItem.id : ruleItem;
      const reference =
        typeof ruleItem === "object" ? ruleItem.reference : false;

      // Only check rule sets (references)
      if (reference || (typeof ruleItem === "object" && ruleItem.reference)) {
        const childRuleSet = ruleSets.find((rs) => rs.id === ruleId);
        if (childRuleSet) {
          // Recursively check for cycles
          if (
            checkCyclicDependency(
              childRuleSet.id,
              targetRuleSetId,
              new Set(visitedIds)
            )
          ) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Helper function to find non-duplicated rules within a rule set with specific state
  const findNonDuplicatedRulesWithState = (ruleSet, currentRuleSet) => {
    if (!ruleSet.rules || ruleSet.rules.length === 0) return [];

    const nonDuplicatedRules = [];

    ruleSet.rules.forEach((ruleItem) => {
      // Handle both old format (just ID) and new format (object with id, priority, reference)
      const ruleId = typeof ruleItem === "object" ? ruleItem.id : ruleItem;
      const reference =
        typeof ruleItem === "object" ? ruleItem.reference : false;
      const priority = typeof ruleItem === "object" ? ruleItem.priority : 1;

      // Only check individual rules (not rule set references)
      if (!reference) {
        const rule = rules.find((r) => r.id === ruleId);
        if (rule) {
          // Check if this rule is not already in the composition
          const existsInComposition = currentRuleSet.some(
            (item) => item.id === rule.id && item.sourceType === ItemType.RULE
          );

          if (!existsInComposition) {
            nonDuplicatedRules.push({
              ...rule,
              sourceType: ItemType.RULE,
              priority: priority,
              reference: false,
            });
          }
        }
      }
    });

    return nonDuplicatedRules;
  };

  // Helper function to find non-duplicated rules within a rule set
  const findNonDuplicatedRules = (ruleSet) => {
    if (!ruleSet.rules || ruleSet.rules.length === 0) return [];

    const nonDuplicatedRules = [];

    ruleSet.rules.forEach((ruleItem) => {
      // Handle both old format (just ID) and new format (object with id, priority, reference)
      const ruleId = typeof ruleItem === "object" ? ruleItem.id : ruleItem;
      const reference =
        typeof ruleItem === "object" ? ruleItem.reference : false;
      const priority = typeof ruleItem === "object" ? ruleItem.priority : 1;

      // Only check individual rules (not rule set references)
      if (!reference) {
        const rule = rules.find((r) => r.id === ruleId);
        if (rule) {
          // Check if this rule is not already in the composition
          const existsInComposition = newRuleSet.some(
            (item) => item.id === rule.id && item.sourceType === ItemType.RULE
          );

          if (!existsInComposition) {
            nonDuplicatedRules.push({
              ...rule,
              sourceType: ItemType.RULE,
              priority: priority,
              reference: false,
            });
          }
        }
      }
    });

    return nonDuplicatedRules;
  };

  // Helper function to copy rules from a rule set
  const copyRulesFromRuleSet = (ruleSet) => {
    // Use current state to avoid stale closure
    const currentRuleSet = currentCompositionRef.current;
    const nonDuplicatedRules = findNonDuplicatedRulesWithState(
      ruleSet,
      currentRuleSet
    );

    if (nonDuplicatedRules.length === 0) {
      showSnackbar(`No new rules to copy from "${ruleSet.name}"`, "info");
      return;
    }

    // Calculate starting priority for new rules
    const maxPriority =
      currentRuleSet.length > 0
        ? Math.max(...currentRuleSet.map((item) => item.priority || 1))
        : 0;

    // Add the non-duplicated rules with sequential priorities
    const rulesToAdd = nonDuplicatedRules.map((rule, index) => ({
      ...rule,
      priority: maxPriority + index + 1,
    }));

    setNewRuleSet((prev) => [...prev, ...rulesToAdd]);
    showSnackbar(
      `Copied ${rulesToAdd.length} rule${
        rulesToAdd.length !== 1 ? "s" : ""
      } from "${ruleSet.name}"`,
      "success"
    );
  };

  // Helper function to get all individual rule IDs currently in composition
  const getAllIndividualRuleIds = (composition) => {
    const ruleIds = new Set();

    composition.forEach((item) => {
      if (item.sourceType === ItemType.RULE) {
        // Direct individual rule
        ruleIds.add(item.id);
      } else if (item.sourceType === ItemType.RULE_SET && item.rules) {
        // Extract all individual rules from rule set
        item.rules.forEach((ruleItem) => {
          if (
            typeof ruleItem === "object" &&
            ruleItem.id &&
            !ruleItem.reference
          ) {
            ruleIds.add(ruleItem.id);
          }
        });
      }
    });

    return ruleIds;
  };

  // Helper function to get all individual rules from a rule set with names
  const getIndividualRulesFromRuleSet = (ruleSet) => {
    if (!ruleSet.rules) return [];

    return ruleSet.rules
      .filter((ruleItem) => {
        return (
          typeof ruleItem === "object" && ruleItem.id && !ruleItem.reference
        );
      })
      .map((ruleItem) => {
        // Find the actual rule details from the rules list
        const fullRule = rules.find((rule) => rule.id === ruleItem.id);
        return {
          id: ruleItem.id,
          name: fullRule ? fullRule.name : ruleItem.id, // Fallback to ID if name not found
          priority: ruleItem.priority,
        };
      });
  };

  // Helper function to show duplication dialog
  const showDuplicationDialog = (
    title,
    message,
    duplicatedRules,
    nonDuplicatedRules,
    onConfirm
  ) => {
    return new Promise((resolve) => {
      setDuplicationDialog({
        open: true,
        title,
        message,
        duplicatedRules,
        nonDuplicatedRules,
        onConfirm: () => {
          setDuplicationDialog((prev) => ({ ...prev, open: false }));
          resolve(true);
          onConfirm && onConfirm();
        },
        onCancel: () => {
          setDuplicationDialog((prev) => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  };

  const handleDrop = (item) => {
    // Use ref to get current state and avoid stale closure
    const currentRuleSet = currentCompositionRef.current;

    console.log("🔍 DEBUG: handleDrop called");
    console.log("  - Item:", item.name, item.id, item.sourceType);
    console.log("  - Current composition count:", currentRuleSet.length);
    console.log(
      "  - Current composition items:",
      currentRuleSet.map((i) => i.name)
    );

    // Get all individual rule IDs currently in composition
    const existingRuleIds = getAllIndividualRuleIds(currentRuleSet);
    console.log(
      "  - Existing individual rule IDs:",
      Array.from(existingRuleIds)
    );

    // Check if the exact same item (rule or rule set) already exists
    const exactItemExists = currentRuleSet.some(
      (existingItem) =>
        existingItem.id === item.id &&
        existingItem.sourceType === item.sourceType
    );

    if (exactItemExists) {
      console.log("  - ✅ Exact item duplicate detected");
      showSnackbar(`${item.name} is already in the rule set`, "warning");
      return;
    }

    // For individual rules: check if this rule ID already exists
    if (item.sourceType === ItemType.RULE) {
      if (existingRuleIds.has(item.id)) {
        console.log(
          "  - ✅ Individual rule already exists (from rule set or direct)"
        );
        showSnackbar(
          `Rule "${item.name}" is already included in the composition`,
          "warning"
        );
        return;
      }
    }

    // For rule sets: check which of their individual rules are already in composition
    if (item.sourceType === ItemType.RULE_SET) {
      const ruleSetIndividualRules = getIndividualRulesFromRuleSet(item);
      const duplicatedRules = ruleSetIndividualRules.filter((rule) =>
        existingRuleIds.has(rule.id)
      );
      const nonDuplicatedRules = ruleSetIndividualRules.filter(
        (rule) => !existingRuleIds.has(rule.id)
      );

      console.log(
        "  - Rule set individual rules:",
        ruleSetIndividualRules.map((r) => r.name)
      );
      console.log(
        "  - Duplicated rules:",
        duplicatedRules.map((r) => r.name)
      );
      console.log(
        "  - Non-duplicated rules:",
        nonDuplicatedRules.map((r) => r.name)
      );

      // If some (but not all) rules are duplicated, ask user what to do
      if (duplicatedRules.length > 0 && nonDuplicatedRules.length > 0) {
        const title = "Duplicate Rules Detected";
        const message = `"${item.name}" contains rules that are already in your composition.`;

        showDuplicationDialog(
          title,
          message,
          duplicatedRules,
          nonDuplicatedRules,
          () => {
            // Copy only the non-duplicated rules
            copyRulesFromRuleSet(item);
          }
        );
        return;
      }

      // If ALL rules are duplicated, don't add anything
      if (duplicatedRules.length > 0 && nonDuplicatedRules.length === 0) {
        console.log("  - ✅ All rules in rule set are already in composition");
        showSnackbar(
          `All rules from "${item.name}" are already in the composition`,
          "warning"
        );
        return;
      }
    }

    // Prevent self-inclusion for rule sets
    if (
      item.sourceType === ItemType.RULE_SET &&
      editingRuleSet &&
      item.id === editingRuleSet.id
    ) {
      const ruleSetIndividualRules = getIndividualRulesFromRuleSet(item);
      const nonDuplicatedRules = ruleSetIndividualRules.filter(
        (rule) => !existingRuleIds.has(rule.id)
      );

      if (nonDuplicatedRules.length > 0) {
        const title = "Cannot Add Rule Set to Itself";
        const message = `Cannot add "${item.name}" to itself, but it contains rules that could be copied individually.`;

        showDuplicationDialog(
          title,
          message,
          [], // No duplicated rules in this case
          nonDuplicatedRules,
          () => {
            copyRulesFromRuleSet(item);
          }
        );
        return;
      }

      showSnackbar(`Cannot add rule set to itself`, "error");
      return;
    }

    // Check for cyclic dependencies when adding a rule set
    if (item.sourceType === ItemType.RULE_SET && editingRuleSet) {
      if (checkCyclicDependency(item.id, editingRuleSet.id)) {
        const ruleSetIndividualRules = getIndividualRulesFromRuleSet(item);
        const nonDuplicatedRules = ruleSetIndividualRules.filter(
          (rule) => !existingRuleIds.has(rule.id)
        );

        if (nonDuplicatedRules.length > 0) {
          const title = "Circular Dependency Detected";
          const message = `Cannot add "${item.name}" as it would create a circular dependency, but it contains rules that can be safely copied.`;

          showDuplicationDialog(
            title,
            message,
            [], // No duplicated rules in this case
            nonDuplicatedRules,
            () => {
              copyRulesFromRuleSet(item);
            }
          );
          return;
        }

        showSnackbar(
          `Cannot add "${item.name}" - this would create a circular dependency`,
          "error"
        );
        return;
      }
    }

    // For rule sets that have no duplications, add them normally without prompting
    // Only show universal choice when there's a reason to choose (like when editing mode or user preference)

    // Calculate next priority (start with 1, or highest current priority + 1)
    const nextPriority =
      newRuleSet.length > 0
        ? Math.max(...newRuleSet.map((item) => item.priority || 1)) + 1
        : 1;

    // If all checks pass, add the item with priority and reference info
    const newItem = {
      ...item,
      priority: nextPriority,
      reference: item.sourceType === ItemType.RULE_SET,
    };

    console.log("  - 🆕 Adding item to composition:", newItem.name);
    setNewRuleSet((prev) => [...prev, newItem]);
    showSnackbar(
      `Added ${item.name} to rule set with priority ${nextPriority}`,
      "success"
    );
  };

  const handleRemove = (index) => {
    const removed = newRuleSet[index];
    setNewRuleSet((prev) => prev.filter((_, i) => i !== index));
    showSnackbar(`Removed ${removed.name} from rule set`, "info");
  };

  const handlePriorityChange = (index, newPriority) => {
    const priority = parseInt(newPriority);
    if (isNaN(priority) || priority < 1) return;

    setNewRuleSet((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], priority };

      // Sort by priority, then by original order (to maintain stability for same priorities)
      updated.sort((a, b) => {
        const priorityDiff = (a.priority || 0) - (b.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;

        // If priorities are the same, maintain relative order by using item ID as secondary sort
        return a.id.localeCompare(b.id);
      });
      return updated;
    });
  };

  const handleMovePriority = (index, direction) => {
    const sortedRuleSet = [...newRuleSet].sort(
      (a, b) => (a.priority || 0) - (b.priority || 0)
    );
    const item = sortedRuleSet[index];
    const currentPriority = item.priority || 1;

    if (direction === "up" && currentPriority > 1) {
      // Move to previous priority level
      const newPriority = currentPriority - 1;
      handlePriorityChange(index, newPriority);
    } else if (direction === "down") {
      // Move to next priority level
      const newPriority = currentPriority + 1;
      handlePriorityChange(index, newPriority);
    }
  };

  const handleViewDetails = (item, type) => {
    setSelectedItemDetails(item);
    setSelectedItemType(type);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedItemDetails(null);
    setSelectedItemType(null);
  };

  const handleEditRuleSet = (ruleSet) => {
    // Load the rule set for editing
    setEditingRuleSet(ruleSet);
    setIsEditMode(true);
    setRuleSetName(ruleSet.name);
    setRuleSetDescription(ruleSet.description || "");

    // Load the rules and rule sets that are part of this rule set
    const ruleSetItems = [];
    if (ruleSet.rules && ruleSet.rules.length > 0) {
      ruleSet.rules.forEach((ruleItem) => {
        // Handle both old format (just ID) and new format (object with id, priority, reference)
        const ruleId = typeof ruleItem === "object" ? ruleItem.id : ruleItem;
        const priority =
          typeof ruleItem === "object"
            ? ruleItem.priority
            : ruleSetItems.length + 1;
        const reference =
          typeof ruleItem === "object" ? ruleItem.reference : false;

        // First check if it's a rule
        const rule = rules.find((r) => r.id === ruleId);
        if (rule && !reference) {
          ruleSetItems.push({
            ...rule,
            sourceType: ItemType.RULE,
            priority: priority,
            reference: false,
          });
        } else {
          // If it's a rule set or marked as reference
          const nestedRuleSet = ruleSets.find((rs) => rs.id === ruleId);
          if (nestedRuleSet) {
            ruleSetItems.push({
              ...nestedRuleSet,
              sourceType: ItemType.RULE_SET,
              priority: priority,
              reference: true,
            });
          }
        }
      });
    }

    // Sort by priority
    ruleSetItems.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    setNewRuleSet(ruleSetItems);
    showSnackbar(`Loaded "${ruleSet.name}" for editing`, "info");
  };

  const resetComposition = () => {
    setNewRuleSet([]);
    setRuleSetName("");
    setRuleSetDescription("");
    setEditingRuleSet(null);
    setIsEditMode(false);
  };

  const handleSaveClick = () => {
    if (newRuleSet.length === 0) {
      showSnackbar("Please add at least one rule or rule set", "warning");
      return;
    }
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    if (!ruleSetName.trim()) {
      showSnackbar("Rule set name is required", "error");
      return;
    }

    // Sort by priority before saving (stable sort for concurrent execution)
    const sortedRuleSet = [...newRuleSet].sort((a, b) => {
      const priorityDiff = (a.priority || 0) - (b.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      // If priorities are the same, maintain relative order by using item ID
      return a.id.localeCompare(b.id);
    });

    const ruleSetData = {
      name: ruleSetName,
      description: ruleSetDescription,
      rules: sortedRuleSet.map((item) => ({
        id: item.id,
        priority: item.priority || 1,
        reference: item.reference || item.sourceType === ItemType.RULE_SET,
      })),
      // Keep legacy fields for backward compatibility
      ruleIds: sortedRuleSet
        .filter((item) => item.sourceType === ItemType.RULE)
        .map((item) => item.id),
      ruleSetIds: sortedRuleSet
        .filter((item) => item.sourceType === ItemType.RULE_SET)
        .map((item) => item.id),
    };

    if (isEditMode && editingRuleSet) {
      // Update existing rule set
      updateRuleSetMutation.mutate({
        id: editingRuleSet.id,
        updates: ruleSetData,
      });
    } else {
      // Create new rule set
      createRuleSetMutation.mutate(ruleSetData);
    }
  };

  const handleDeleteRuleSet = (ruleSetId) => {
    if (window.confirm("Are you sure you want to delete this rule set?")) {
      deleteRuleSetMutation.mutate(ruleSetId);
    }
  };

  if (rulesLoading || ruleSetsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Rule Set Composer
        </Typography>

        {/* Composition Summary */}
        {newRuleSet.length > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" gutterBottom color="primary">
              Composition Summary
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                label={`${
                  newRuleSet.filter((item) => item.sourceType === ItemType.RULE)
                    .length
                } Rules`}
                color="primary"
                size="small"
              />
              <Chip
                label={`${
                  newRuleSet.filter(
                    (item) => item.sourceType === ItemType.RULE_SET
                  ).length
                } Rule Sets`}
                color="secondary"
                size="small"
              />
              {(() => {
                const priorityLevels = [
                  ...new Set(newRuleSet.map((item) => item.priority || 1)),
                ].sort((a, b) => a - b);
                const concurrentGroups = priorityLevels.filter(
                  (priority) =>
                    newRuleSet.filter(
                      (item) => (item.priority || 1) === priority
                    ).length > 1
                );

                return (
                  <>
                    <Chip
                      label={`${priorityLevels.length} Priority Levels`}
                      color="info"
                      size="small"
                      variant="outlined"
                    />
                    {concurrentGroups.length > 0 && (
                      <Chip
                        label={`${concurrentGroups.length} Concurrent Groups`}
                        color="warning"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </>
                );
              })()}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 3, height: "80vh" }}>
          {/* Library Panel */}
          <Paper sx={{ width: "40%", p: 2, overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Rule Library
            </Typography>

            {/* Available Rules */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Available Rules ({rules.length})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {rules.map((rule) => {
                  const { disabled, reason } = isRuleDisabled(rule);
                  return (
                    <DraggableItem
                      key={`rule-${rule.id}`}
                      item={rule}
                      type={ItemType.RULE}
                      source="library"
                      onViewDetails={handleViewDetails}
                      disabled={disabled}
                      disabledReason={reason}
                    />
                  );
                })}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Existing Rule Sets */}
            <Box>
              <Typography variant="subtitle1" color="secondary" gutterBottom>
                Existing Rule Sets ({ruleSets.length})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {ruleSets.map((ruleSet) => (
                  <Box
                    key={`ruleset-${ruleSet.id}`}
                    sx={{ position: "relative" }}
                  >
                    {(() => {
                      const { disabled, reason } = isRuleSetDisabled(ruleSet);
                      return (
                        <DraggableItem
                          item={ruleSet}
                          type={ItemType.RULE_SET}
                          source="library"
                          onViewDetails={handleViewDetails}
                          disabled={disabled}
                          disabledReason={reason}
                        />
                      );
                    })()}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditRuleSet(ruleSet)}
                        color="primary"
                        title="Edit Rule Set"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRuleSet(ruleSet.id)}
                        color="error"
                        title="Delete Rule Set"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Composition Panel */}
          <Paper
            sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6">
                  {isEditMode
                    ? `Editing "${editingRuleSet?.name}" (${newRuleSet.length} items)`
                    : `New Rule Set Composition (${newRuleSet.length} items)`}
                </Typography>
                {isEditMode && (
                  <Chip
                    label="EDIT MODE"
                    color="warning"
                    size="small"
                    variant="filled"
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={resetComposition}
                  disabled={newRuleSet.length === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveClick}
                  disabled={newRuleSet.length === 0}
                >
                  {isEditMode ? "Update Rule Set" : "Save Rule Set"}
                </Button>
              </Box>
            </Box>

            <DropZone onDrop={handleDrop}>
              {newRuleSet.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 150,
                    color: "text.secondary",
                  }}
                >
                  <AddIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6">
                    Drag rules and rule sets here
                  </Typography>
                  <Typography variant="body2">
                    Build your rule set by dragging items from the library
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    maxHeight: "calc(80vh - 150px)", // Increase scrollable area
                    overflow: "auto",
                    pr: 1, // Add padding for scrollbar
                  }}
                >
                  {newRuleSet
                    .sort((a, b) => {
                      const priorityDiff =
                        (a.priority || 0) - (b.priority || 0);
                      if (priorityDiff !== 0) return priorityDiff;
                      // If priorities are the same, maintain relative order by using item ID
                      return a.id.localeCompare(b.id);
                    })
                    .map((item, index) => (
                      <Card
                        key={`composition-${item.sourceType}-${item.id}-${index}`}
                        sx={{
                          border: 1,
                          borderColor:
                            item.sourceType === ItemType.RULE
                              ? "primary.light"
                              : "secondary.light",
                          bgcolor: item.reference
                            ? "secondary.50"
                            : "background.paper",
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            {/* Priority Controls */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                minWidth: 80,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Priority
                                {(() => {
                                  const samePriorityCount = newRuleSet.filter(
                                    (other) => other.priority === item.priority
                                  ).length;
                                  return samePriorityCount > 1
                                    ? ` (${samePriorityCount} concurrent)`
                                    : "";
                                })()}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <TextField
                                  size="small"
                                  value={item.priority || 1}
                                  onChange={(e) =>
                                    handlePriorityChange(index, e.target.value)
                                  }
                                  type="number"
                                  inputProps={{
                                    min: 1,
                                    style: { textAlign: "center", width: 40 },
                                  }}
                                  variant="outlined"
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleMovePriority(index, "up")
                                    }
                                    disabled={item.priority <= 1}
                                  >
                                    <ArrowUpIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleMovePriority(index, "down")
                                    }
                                  >
                                    <ArrowDownIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>

                            {/* Item Details */}
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                <DragIcon color="action" fontSize="small" />
                                {item.reference && (
                                  <LinkIcon
                                    color="secondary"
                                    fontSize="small"
                                    title="Rule Set Reference"
                                  />
                                )}
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                >
                                  {item.name}
                                </Typography>
                                <Chip
                                  label={
                                    item.sourceType === ItemType.RULE
                                      ? item.ruleType || "Rule"
                                      : "Rule Set"
                                  }
                                  size="small"
                                  color={
                                    item.sourceType === ItemType.RULE
                                      ? "primary"
                                      : "secondary"
                                  }
                                  variant={
                                    item.reference ? "filled" : "outlined"
                                  }
                                />
                                {item.reference && (
                                  <Chip
                                    label="Reference"
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              {item.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  {item.description}
                                </Typography>
                              )}
                            </Box>

                            {/* Action Buttons */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleViewDetails(item, item.sourceType)
                                }
                                color="info"
                                title="View Details"
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleRemove(index)}
                                color="error"
                                title="Remove"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              )}
            </DropZone>
          </Paper>
        </Box>

        {/* Save Dialog */}
        <Dialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {isEditMode ? "Update Rule Set" : "Save Rule Set"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Rule Set Name"
              fullWidth
              variant="outlined"
              value={ruleSetName}
              onChange={(e) => setRuleSetName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={ruleSetDescription}
              onChange={(e) => setRuleSetDescription(e.target.value)}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                This rule set will contain:
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                {newRuleSet.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", py: 0.5 }}
                  >
                    <Chip
                      label={
                        item.sourceType === ItemType.RULE ? "Rule" : "Rule Set"
                      }
                      size="small"
                      color={
                        item.sourceType === ItemType.RULE
                          ? "primary"
                          : "secondary"
                      }
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveConfirm}
              variant="contained"
              disabled={
                createRuleSetMutation.isPending ||
                updateRuleSetMutation.isPending
              }
            >
              {createRuleSetMutation.isPending ||
              updateRuleSetMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update"
                : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          open={detailsDialogOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedItemType === ItemType.RULE
              ? "Rule Details"
              : "Rule Set Details"}
          </DialogTitle>
          <DialogContent>
            {selectedItemDetails && (
              <Box sx={{ pt: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedItemDetails.name}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type:
                  </Typography>
                  <Chip
                    label={
                      selectedItemType === ItemType.RULE
                        ? selectedItemDetails.ruleType || "Rule"
                        : "Rule Set"
                    }
                    color={
                      selectedItemType === ItemType.RULE
                        ? "primary"
                        : "secondary"
                    }
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                {selectedItemDetails.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedItemDetails.description}
                    </Typography>
                  </Box>
                )}

                {selectedItemType === ItemType.RULE && (
                  <>
                    {selectedItemDetails.condition && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          SpEL Condition:
                        </Typography>
                        <Paper sx={{ p: 2, mt: 0.5, bgcolor: "grey.50" }}>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                              margin: 0,
                            }}
                          >
                            {selectedItemDetails.condition}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {selectedItemDetails.errorCode && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Error Code:
                        </Typography>
                        <Chip
                          label={selectedItemDetails.errorCode}
                          variant="outlined"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    )}
                  </>
                )}

                {selectedItemType === ItemType.RULE_SET &&
                  selectedItemDetails.rules && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Contains {selectedItemDetails.rules.length} rule
                        {selectedItemDetails.rules.length !== 1 ? "s" : ""}:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        {selectedItemDetails.rules.map((ruleItem, index) => {
                          // Handle both old format (just ID) and new format (object with id, priority, reference)
                          const ruleId =
                            typeof ruleItem === "object"
                              ? ruleItem.id
                              : ruleItem;
                          const priority =
                            typeof ruleItem === "object"
                              ? ruleItem.priority
                              : null;
                          const reference =
                            typeof ruleItem === "object"
                              ? ruleItem.reference
                              : false;

                          const rule = rules.find((r) => r.id === ruleId);
                          const ruleSet = ruleSets.find(
                            (rs) => rs.id === ruleId
                          );

                          // Determine if it's a rule or rule set reference
                          const item = reference ? ruleSet : rule;
                          const itemType = reference ? "Rule Set" : "Rule";

                          return item ? (
                            <Chip
                              key={index}
                              label={`${item.name}${
                                priority ? ` (Priority: ${priority})` : ""
                              }`}
                              size="small"
                              variant="outlined"
                              color={reference ? "secondary" : "primary"}
                              title={`${itemType}${
                                priority ? ` - Priority: ${priority}` : ""
                              }${reference ? " (Reference)" : ""}`}
                            />
                          ) : (
                            <Chip
                              key={index}
                              label={`${itemType} ID: ${ruleId}${
                                priority ? ` (Priority: ${priority})` : ""
                              }`}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                {selectedItemDetails.createdAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {new Date(selectedItemDetails.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedItemDetails.id}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Duplication Dialog */}
        <Dialog
          open={duplicationDialog.open}
          onClose={duplicationDialog.onCancel}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{duplicationDialog.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              {duplicationDialog.message}
            </Typography>

            {duplicationDialog.duplicatedRules.length > 0 && (
              <>
                <Typography variant="subtitle2" color="error" sx={{ mt: 2 }}>
                  Already in composition (
                  {duplicationDialog.duplicatedRules.length} rule
                  {duplicationDialog.duplicatedRules.length !== 1 ? "s" : ""}):
                </Typography>
                <Box sx={{ ml: 2, mb: 2 }}>
                  {duplicationDialog.duplicatedRules.map((rule, index) => (
                    <Chip
                      key={index}
                      label={rule.name}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </>
            )}

            {duplicationDialog.nonDuplicatedRules.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  color="success.main"
                  sx={{ mt: 1 }}
                >
                  Available to add (
                  {duplicationDialog.nonDuplicatedRules.length} rule
                  {duplicationDialog.nonDuplicatedRules.length !== 1 ? "s" : ""}
                  ):
                </Typography>
                <Box sx={{ ml: 2 }}>
                  {duplicationDialog.nonDuplicatedRules.map((rule, index) => (
                    <Chip
                      key={index}
                      label={rule.name}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={duplicationDialog.onCancel} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={duplicationDialog.onConfirm}
              variant="contained"
              color="primary"
              disabled={duplicationDialog.nonDuplicatedRules.length === 0}
            >
              Add {duplicationDialog.nonDuplicatedRules.length} Rule
              {duplicationDialog.nonDuplicatedRules.length !== 1 ? "s" : ""}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DndProvider>
  );
};

export default RuleSetEditor;
