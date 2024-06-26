'use client';

import {useState, FormEvent} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import FormField from '@/components/ui/form-field';
import {useStore} from '@/app/store';
import makeOrdinal from '@/lib/make-ordinal';
import { ReminderType } from "@/types/reminder";


type Props = {
  className?: string,
  handleFormSubmit: (value: ReminderType) => void,
  reminder:ReminderType
}

type EveryInputProps = {
  repeatValue1: number,
  repeatValue2: number,
  repeatValue3: number,
  setRepeatValue1: React.Dispatch<React.SetStateAction<number>>,
  setRepeatValue2: React.Dispatch<React.SetStateAction<number>>,
  setRepeatValue3: React.Dispatch<React.SetStateAction<number>>
}

type RowsInputProps = {
  repeatValue1: number,
  repeatValue2: number,
  setRepeatValue1:React.Dispatch<React.SetStateAction<number>>,
  setRepeatValue2:React.Dispatch<React.SetStateAction<number>>
}



export default function ReminderForm ({className, handleFormSubmit, reminder}:Props) {
  const {count} = useStore();

  const [reminderType, setReminderType] = useState<string>(reminder.type);
  const [reminderTitle, setReminderTitle] = useState<string>(reminder.title);
  const [reminderNote, setReminderNote] = useState(reminder.note);
  const [repeatValue1, setRepeatValue1] = useState(reminder.repeat.interval || reminder.repeat.from || 0);
  const [repeatValue2, setRepeatValue2] = useState(reminder.repeat.times || reminder.repeat.until || 0);
  const [repeatValue3, setRepeatValue3] = useState(reminder.repeat.start || count);

  function handleTypeChange (value:string):void {
    setReminderType(value);
  }

  function handleSubmit (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const isValid = validateForm(repeatValue1, repeatValue2, repeatValue3, reminderTitle);

    if (isValid.length > 0) {
      return false;
    }

    const newReminder: ReminderType = {
      title: reminderTitle,
      type: reminderType,
      note: reminderNote,
      notification: true,
      repeat: {
        interval: 0,
      }
    };

    if (reminderType === "every") {
      newReminder.repeat = {
        interval: repeatValue1,
        times: repeatValue2,
        start: repeatValue3
      };
    } else {
      newReminder.repeat = {
        from: repeatValue1,
        until: repeatValue2
      };
    }

    handleFormSubmit(newReminder);
  }

  // toggle form input 
  let inputType;

  if (reminderType === 'every') {
    inputType = <RepeatEveryInputs
      repeatValue1={repeatValue1} repeatValue2={repeatValue2} repeatValue3={repeatValue3} setRepeatValue1={setRepeatValue1} setRepeatValue2={setRepeatValue2} setRepeatValue3={setRepeatValue3} />;
  } else {
    inputType =
      <ForRowsInputs repeatValue1={repeatValue1} repeatValue2={repeatValue2} setRepeatValue1={setRepeatValue1} setRepeatValue2={setRepeatValue2} />;
  }

  const errorMessages = validateForm(repeatValue1, repeatValue2, repeatValue3, reminderTitle);

  return (
    <form className={cn("grid items-start gap-5", className)} onSubmit={handleSubmit}>
      <FormField>
        <Label variant='inline' htmlFor="reminderTitle">Title</Label>
        <Input variant='inline' type="text" id="reminderTitle" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} />
      </FormField>
      <h3 className='font-semibold text-slate-800 pl-1 pt-2 -mb-2'>Repetition:</h3>
      <Select onValueChange={handleTypeChange} defaultValue="every">
        <SelectTrigger className="w-[100%]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="every">Repeat every</SelectItem>
          <SelectItem value="for-rows">Repeat for rows</SelectItem>
        </SelectContent>
      </Select>
      {inputType}
      <h3 className='text-base font-semibold text-slate-800 pl-1 pt-2 -mb-2'>Add a note (optional):</h3>
      <Textarea
        className="boder-none rounded-lg p-3"
        placeholder="you can add a note to your reminder e.g. k1, k2tog, knit to 3 sts before end, ssk, k1."
        value={reminderNote}
        onChange={e => setReminderNote(e.target.value)}
        rows={5}
      />
      {errorMessages.map((msg, index) => <p key={index}>{msg}</p>)}

      <Button type="submit">Save changes</Button>
    </form>
  );
}


function RepeatEveryInputs ({repeatValue1, repeatValue2, repeatValue3, setRepeatValue1, setRepeatValue2, setRepeatValue3}: EveryInputProps) {
  return (
    <div className="flex gap-x-5 w-full">
      <FormField className='flex-1'>
        <Input variant="inline" min="0" type="number" id="start" value={numtoString(repeatValue3)} onChange={e => {setRepeatValue3(parseInt(e.target.value));}} />
        <Label variant="inline" htmlFor="start">start row</Label>
      </FormField>
      <FormField className='flex-1'>
        <Input variant="inline" min="0" type="number" id="rows" value={numtoString(repeatValue1)} onChange={e => {setRepeatValue1(parseInt(e.target.value));}} />
        <Label variant="inline" htmlFor="rows">every<br />{makeOrdinal(repeatValue1)} </Label>
      </FormField>
      <FormField className='flex-1'>
        <Input variant="inline" min="0" type="number" id="times" value={numtoString(repeatValue2)} onChange={e => setRepeatValue2(parseInt(e.target.value))} />
        <Label variant="inline" htmlFor="times">times</Label>
      </FormField>
    </div>
  );
}


function ForRowsInputs ({repeatValue1, repeatValue2, setRepeatValue1, setRepeatValue2}:RowsInputProps) {
  return (
    <div className="flex gap-x-5 w-full">
      <FormField className='flex-1'>
        <Label variant='inline' htmlFor="from">from</Label>
        <Input variant='inline' min="0" type="number" id="from" value={numtoString(repeatValue1)} onChange={e => {setRepeatValue1(parseInt(e.target.value));}} />
      </FormField>
      <FormField className='flex-1'>
        <Label variant='inline' htmlFor="until">until</Label>
        <Input variant='inline' min="0" type="number" id="until" value={numtoString(repeatValue2)} onChange={e => setRepeatValue2(parseInt(e.target.value))} />
      </FormField>
    </div>
  );
}

function validateForm (repeatValue1:number, repeatValue2:number, repeatValue3:number, title:string) {
  const messages = [];

  if (repeatValue1 === 0
    || Number.isNaN(repeatValue1)
    || repeatValue2 === 0
    || Number.isNaN(repeatValue2)
    || repeatValue3 === 0
    || Number.isNaN(repeatValue3)
    || title.length === 0
  ) {
    messages.push('please fill in the missing fields.');
  }

  if (repeatValue1 < 0 || repeatValue2 < 0) {
    messages.push('input cannot be a negative number.');
  }

  return messages;
}


function numtoString (num:number) {
  if (Number.isNaN(num)) return '';
  return num.toString();
}

