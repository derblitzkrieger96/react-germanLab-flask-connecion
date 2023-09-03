import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  // State to store quiz questions
  const [questions, setQuestions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(""); // State to store the selected German Level
  const [userName, setUserName] = useState("");

  // Function to handle input change of the userName
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value); // Update the selected German level value when the user makes a selection
  };

  useEffect(() => {
    // Fetch quiz data when the component mounts
    if (selectedValue !== "") {
      const fetchData = async () => {
        const res = await fetch(
          `https://api-germanlab.onrender.com/quiz/${selectedValue}/all`
        );
        const data = await res.json();

        setQuestions(data);
      };
      fetchData();
    }
  }, [selectedValue]);

  return (
    <div className="App">
      {/* Header component */}
      <Header />
      {/* Get user name component */}
      <GetName userName={userName} handleNameChange={handleNameChange} />
      {/* DropDown menu to select the german level */}
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

// GetName component for displaying and handling user's name input
function GetName(props) {
  return (
    <div className="get-name">
      <h1>Welcome to My App</h1>
      {/* Label and input field for entering the user's name */}
      <label>
        Enter your name:
        <input
          className="input-name"
          type="text"
          value={props.userName}
          onChange={props.handleNameChange}
        />
      </label>
      {/* Display a greeting if the user's name is not empty */}
      {props.userName !== "" && <p>Hello, {props.userName}!</p>}
    </div>
  );
}

// DropDown component for selecting a German language level
function DropDown(props) {
  return (
    <div className="dropDown">
      <h2>Select a German level</h2>
      {/* Dropdown menu for selecting the language level */}
      <select
        className="select" // CSS class for styling
        value={props.selectedValue} // Value is controlled by the selectedValue prop
        onChange={props.handleSelectChange} // Event handler for dropdown changes
      >
        <option value="">Select an option</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
      </select>
      {/* Display the selected value if a level is chosen */}
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

  // get right answers
  const right_answers = Object.keys(props.questions).reduce((acc, q) => {
    acc[q] = props.questions[q].right_answer;
    return acc;
  }, {});

  // Map through quiz questions and render Question components
  const questions = Object.keys(props.questions).map((q) => {
    return (
      <Question
        key={q}
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

    const accuracy = calculateAccuracy(right_answers, formDataValues);
    setScore(accuracy);
    setFormSubmitted(true);
    setFormDataIsChecked(formDataValues);
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

// Question component for rendering quiz questions and options
function Question(props) {
  // Get the selected option for this question
  const selected = props.formDataIsChecked[props.number];
  // Map through question options and render radio buttons
  const options = props.options.map((o, index) => {
    return (
      <label className="label" htmlFor={o} key={o}>
        <input
          type="radio"
          name={props.number} // Use the question number as the radio group name
          id={o}
          value={o}
          onChange={props.onChangeForm} // Event handler for radio button changes
          required // Make the radio button required
          key={o + index}
        ></input>
        {/* Option component for displaying option text */}
        <Option
          key={o}
          option={o} // Pass the option text as a prop
          style={{
            // Determine the style based on form submission and correctness
            color:
              props.formSubmitted && selected === o
                ? props.right_answer === o
                  ? "green" // Green for correct answers
                  : "red" // Red for incorrect answers
                : "black", // Default color for unanswered questions
            border:
              props.formSubmitted && selected === o
                ? props.right_answer === o
                  ? "2px solid green" // Green border for correct answers
                  : "2px solid red" // Red border for incorrect answers
                : "black", // Default border for unanswered questions
          }}
          right_answer={props.right_answer}
        />
      </label>
    );
  });
  return (
    <div>
      {/* Display the question statement */}
      <h2 className="statement">
        Question #{props.number}: {props.statement}
      </h2>
      {/* Display the options */}
      <ul>{options}</ul>
    </div>
  );
}

// Option component for displaying individual quiz options
function Option(props) {
  return (
    <p className="option" style={props.style}>
      {props.option}
    </p>
  );
}

// Footer component (placeholder, can be extended as needed)
function Footer() {
  return <div></div>;
}

export default App;
