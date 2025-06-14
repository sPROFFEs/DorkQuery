"use client";

import { useState } from "react";
import { DorkBlock, DorkBlockType } from "@/types/dork"; // DorkBlockType might not be needed directly
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you'll use this for text fields
import { Textarea } from "@/components/ui/textarea"; // Assuming you'll use this for description
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { generateId } from "@/lib/dork-utils"; // Import generateId from utils

interface CustomBlockManagerProps {
  onSaveCustomBlock: (newBlock: DorkBlock) => void;
  customBlocks: DorkBlock[]; // To check for duplicate operators
}

export function CustomBlockManager({ onSaveCustomBlock, customBlocks }: CustomBlockManagerProps) {
  const { toast } = useToast();
  const [newCustomOperator, setNewCustomOperator] = useState("");
  const [newCustomPlaceholder, setNewCustomPlaceholder] = useState("");
  const [newCustomDescription, setNewCustomDescription] = useState("");
  const [operatorError, setOperatorError] = useState<string | null>(null);

  const validateAndSave = () => {
    const operator = newCustomOperator.trim();
    const placeholder = newCustomPlaceholder.trim();
    const description = newCustomDescription.trim();

    setOperatorError(null); // Reset error

    if (!operator || !placeholder || !description) {
      toast({
        title: "Validation Error",
        description: "All fields are required to create a custom block.",
        variant: "destructive",
      });
      return;
    }

    if (!operator.endsWith(":")) {
      setOperatorError("Operator must end with a colon (e.g., myop:).");
      toast({
        title: "Validation Error",
        description: "Operator must end with a colon (:).",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate operator in existing custom blocks
    if (customBlocks.some(block => block.operator === operator)) {
      setOperatorError(`Operator "${operator}" already exists. Please use a unique operator.`);
      toast({
        title: "Validation Error",
        description: `Operator "${operator}" already exists. Please use a unique operator.`,
        variant: "destructive",
      });
      return;
    }


    const newBlock: DorkBlock = {
      id: `custom-${generateId()}`, // Prefixed ID for custom block template
      type: "custom",
      operator: operator,
      value: "",
      placeholder: placeholder,
      description: description,
      icon: "edit-3",
    };

    onSaveCustomBlock(newBlock);

    toast({
      title: "Custom Block Saved!",
      description: `The block "${operator}" has been added to your palette.`,
    });

    // Reset form inputs
    setNewCustomOperator("");
    setNewCustomPlaceholder("");
    setNewCustomDescription("");
    setOperatorError(null);
  };

  // Render Structure
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Custom Block</CardTitle>
        <CardDescription>
          Define a new operator block to reuse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Operator (e.g., myop:)"
            value={newCustomOperator}
            onChange={(e) => {
              setNewCustomOperator(e.target.value);
              if (operatorError) setOperatorError(null); // Clear error on change
            }}
            aria-label="Custom operator"
            className={operatorError ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {operatorError && <p className="text-xs text-destructive mt-1">{operatorError}</p>}
        </div>
        <Input
          type="text"
          placeholder="Placeholder (e.g., value hint)"
          value={newCustomPlaceholder}
          onChange={(e) => setNewCustomPlaceholder(e.target.value)}
          aria-label="Custom placeholder"
        />
        <Textarea
          placeholder="Brief description of the operator"
          value={newCustomDescription}
          onChange={(e) => setNewCustomDescription(e.target.value)}
          aria-label="Custom description"
          rows={3}
        />
        <Button onClick={validateAndSave} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Block to Palette
        </Button>
      </CardContent>
    </Card>
  );
}
