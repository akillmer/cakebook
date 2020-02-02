import React from "react";

const questions = [
  "What was your childhood nickname?",
  "What street did you live as child?",
  "What's your oldest sibling's middle name?",
  "What school did you attend for sixth grade?",
  "In what city or town did your parents meet?",
  "In what city or town was your first job?",
  "What was your dream job as a child?",
  "Who was your childhood hero?",
  "What was the make/model of your first car?",
  "What is your preferred musical genre?"
];

const SelectQuestion = props => (
  <select
    name={props.name}
    disabled={props.disabled}
    onChange={props.onChange}
    defaultValue={props.defaultValue}
  >
    <option value=""></option>
    {questions.map((v, i) => (
      <option key={i} value={v}>
        {v}
      </option>
    ))}
  </select>
);

export default SelectQuestion;
