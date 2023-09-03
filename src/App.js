import "./App.css";
import { useEffect, useState } from "react";

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
  console.log("aaaaaaaaaa", props.questions);

  // Function to handle form input changes
  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
        formData={formData}
        onChangeForm={onChangeForm}
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
    console.log("formData: ", formData);

    const accuracy = calculateAccuracy(right_answers, formData);
    setScore(accuracy);
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
  };

  function get_final_message(score, level, name) {
    let message = "";
    let emoji = "";

    // Determine the message and emoji based on the user's score
    if (score == 100) {
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
    <form onSubmit={handleSubmit}>
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
  // Map through question options and render radio buttons
  const options = props.options.map((o) => (
    <label className="label" htmlFor={o}>
      <input
        type="radio"
        name={props.number}
        id={o}
        value={o}
        onChange={props.onChangeForm}
        required
      ></input>
      <Option option={o} />
    </label>
  ));
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
  return <p className="option">{props.option}</p>;
}

function Footer() {
  return <div></div>;
}

export default App;
