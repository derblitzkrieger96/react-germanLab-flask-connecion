import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  // State to store quiz questions
  const [questions, setQuestions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(""); // State to store the selected value
  const [userName, setUserName] = useState("");

  // Function to handle input change
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value); // Update the selected value when the user makes a selection
  };

  useEffect(() => {
    // Fetch quiz data when the component mounts
    if (selectedValue !== "") {
      const fetchData = async () => {
        const res = await fetch(
          `https://api-germanlab.onrender.com/quiz/${selectedValue}/all`
        );
        const data = await res.json();
        console.log(data);
        setQuestions(data);
      };
      fetchData();
    }
  }, [selectedValue]);

  return (
    <div className="App">
      {/* Header component */}
      <Header />
      <GetName userName={userName} handleNameChange={handleNameChange} />
      <DropDown
        selectedValue={selectedValue}
        handleSelectChange={handleSelectChange}
      />
      {/* Quiz component with questions and form */}
      {selectedValue !== "" && (
        <Quiz questions={questions} userName={userName} level={selectedValue} />
      )}
      {/* Footer component */}
      <Footer />
    </div>
  );
}

function GetName(props) {
  return (
    <div className="get-name">
      <h1>Welcome to My App</h1>
      <label>
        Enter your name:
        <input
          className="input-name"
          type="text"
          value={props.userName}
          onChange={props.handleNameChange}
        />
      </label>
      {props.userName !== "" && <p>Hello, {props.userName}!</p>}
    </div>
  );
}

function DropDown(props) {
  return (
    <div className="dropDown">
      <h2>Select a German level</h2>
      <select
        className="select"
        value={props.selectedValue}
        onChange={props.handleSelectChange}
      >
        <option value="">Select an option</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
      </select>
      {props.selectedValue !== "" && <p>You selected: {props.selectedValue}</p>}
    </div>
  );
}

function Header() {
  return <h1 className="header">German Lab Quiz</h1>;
}

function Quiz(props) {
  // State to store form data (selected answers)
  const [formData, setFormData] = useState({
    1: "", // Initialize with an empty answer for question 1
  });
  const [score, setScore] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formDataIsChecked, setFormDataIsChecked] = useState({});
  console.log("aaaaaaaaaa", props.questions);

  const resetFormData = () => {
    setFormData({
      1: {}, // Initialize with an empty answer for question 1
    });
  };

  const formRef = useRef(null);
  // Watch for changes in props.level
  useEffect(() => {
    // Reset formData when props.level changes
    resetFormData();
    formRef.current.reset();
  }, [props.level]);

  // Function to handle form input changes
  const onChangeForm = (e) => {
    const { name, value } = e.target;
    const isChecked = e.target.checked;
    setFormData({
      ...formData,
      [name]: { value, isChecked },
    });
  };

  // Map through quiz questions and render Question components
  const right_answers = Object.keys(props.questions).reduce((acc, q) => {
    acc[q] = props.questions[q].right_answer;
    return acc;
  }, {});

  console.log("right_answers", right_answers);
  const questions = Object.keys(props.questions).map((q) => {
    console.log(props.questions[q]);
    return (
      <Question
        number={q}
        statement={props.questions[q].statement}
        options={props.questions[q].options}
        right_answer={props.questions[q].right_answer}
        formData={formData}
        onChangeForm={onChangeForm}
        formSubmitted={formSubmitted}
        formDataIsChecked={formDataIsChecked}
      />
    );
  });

  //calculates the score
  const calculateAccuracy = (correctAnswers, userAnswers) => {
    const questionIds = Object.keys(correctAnswers);
    const totalQuestions = questionIds.length;
    let correctCount = 0;

    for (const questionId of questionIds) {
      if (correctAnswers[questionId] === userAnswers[questionId]) {
        correctCount++;
      }
    }

    const accuracy = (correctCount / totalQuestions) * 100;
    return accuracy;
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataValues = Object.keys(formData).reduce((acc, q) => {
      acc[q] = formData[q].value;
      return acc;
    }, {});
    const formDataIsChecked = Object.keys(formData).reduce((acc, q) => {
      acc[formData[q].value] = formData[q].isChecked;
      return acc;
    }, {});
    console.log("formData: ", formDataValues);
    console.log("formData: ", formDataIsChecked);

    const accuracy = calculateAccuracy(right_answers, formDataValues);
    setScore(accuracy);
    setFormSubmitted(true);
    setFormDataIsChecked(formDataValues);
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
  };

  function get_final_message(score, level, name) {
    let message = "";
    let emoji = "";

    // Determine the message and emoji based on the user's score
    if (score === 100) {
      message = `Congratulations! Perfect score! You have mastered the ${level} level of German!`;
      emoji = "🎉🏆👏";
    } else if (score < 100 && score >= 80) {
      message = `Good job! You're making steady progress!`;
      emoji = "👍😊";
    } else if (score < 80 && score >= 60) {
      message = `Don't give up! With more practice, you'll do even better!`;
      emoji = "💪🌟";
    } else if (score < 60 && score >= 40) {
      message = `Remember, every mistake is an opportunity to learn. Keep going!`;
      emoji = "🤔🚀";
    } else {
      message = `You're just beginning. Keep learning and your score will improve!`;
      emoji = "😢📚";
    }

    // Construct the final message
    const final_message = `${name}, ${message}\nYour score is: ${score.toFixed(
      2
    )}% ${emoji}`;
    return final_message;
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      {/* Render the list of questions */}
      {questions}
      <button className="btn-submit" type="submit">
        Submit
      </button>
      {/* Display the score message */}
      {score !== null && (
        <div className="score-message">
          {get_final_message(score, props.level, props.userName)}
        </div>
      )}
    </form>
  );
}
function Question(props) {
  console.log("lloego", props.formDataIsChecked);
  // Map through question options and render radio buttons
  const selected = props.formDataIsChecked[props.number];
  const options = props.options.map((o, index) => {
    return (
      <label className="label" htmlFor={o}>
        <input
          type="radio"
          name={props.number}
          id={o}
          value={o}
          onChange={props.onChangeForm}
          required
        ></input>
        <Option
          option={o}
          style={{
            color:
              props.formSubmitted && selected === o
                ? props.right_answer === o
                  ? "green"
                  : "red"
                : "black",
            border:
              props.formSubmitted && selected === o
                ? props.right_answer === o
                  ? "2px solid green"
                  : "2px solid red"
                : "black",
          }}
          right_answer={props.right_answer}
        />
      </label>
    );
  });
  return (
    <div>
      <h2 className="statement">
        Question #{props.number}: {props.statement}
      </h2>
      <ul>{options}</ul>
    </div>
  );
}

function Option(props) {
  return (
    <p className="option" style={props.style}>
      {props.option}
    </p>
  );
}

function Footer() {
  return <div></div>;
}

export default App;
