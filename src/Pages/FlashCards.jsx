import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Select,
  message,
  Typography,
  Space,
  Tag,
  Row,
  Col,
} from "antd";
import Navbar from "../components/Navbar";

const { Title, Text } = Typography;
const { Option } = Select;

const FlashCards = () => {
  const [datasets, setDatasets] = useState(() => {
    const savedDatasets = localStorage.getItem("wordDatasets");
    return savedDatasets ? JSON.parse(savedDatasets) : {};
  });
  const [activeDataset, setActiveDataset] = useState(
    Object.keys(datasets)[0] || ""
  );
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [wordCount, setWordCount] = useState(10);

  useEffect(() => {
    if (activeDataset && datasets[activeDataset]) {
      const unknownWords = datasets[activeDataset].filter(
        (word) => word.knowledge === "Don't Know"
      );
      setWords(shuffleArray(unknownWords).slice(0, wordCount));
    }
  }, [activeDataset, datasets, wordCount]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartGame = () => {
    if (words.length === 0) {
      message.warning(
        "No unknown words available in the selected dataset. Please review your word list or choose another dataset."
      );
      return;
    }
    setGameStarted(true);
    setCurrentWordIndex(0);
    setShowAnswer(false);
  };

  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowAnswer(false);
    } else {
      message.success("Game Over! You have completed all the words.");
      setGameStarted(false);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowAnswer(false);
    }
  };

  const renderGameContent = () => {
    const currentWord = words[currentWordIndex];
    return (
      <>
        <Title level={4}>{`Word ${currentWordIndex + 1} of ${
          words.length
        }`}</Title>
        <Card style={{ width: 300, margin: "0 auto", textAlign: "center" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div
              onClick={handleCardClick}
              style={{
                height: "150px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: "4px",
                fontSize: "24px",
              }}
            >
              {showAnswer ? (
                <>
                  <Text strong style={{ fontSize: "24px" }}>
                    {currentWord.translation}
                  </Text>
                  <Text style={{ fontSize: "18px" }}>
                    {currentWord.example}
                  </Text>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Text
                      strong
                      style={{ marginRight: "10px", fontSize: "24px" }}
                    >
                      {currentWord.word}
                    </Text>
                    {currentWord.types &&
                      currentWord.types.map((type, index) => (
                        <Tag
                          key={index}
                          color="blue"
                          style={{ fontSize: "18px" }}
                        >
                          {type}
                        </Tag>
                      ))}
                  </div>
                </>
              )}
            </div>
            <Space></Space>
          </Space>
        </Card>

        <Button
          type="primary"
          onClick={handlePreviousWord}
          disabled={currentWordIndex === 0}
          style={{ margin: "10px", fontSize: "16px" }}
        >
          Previous
        </Button>
        <Button
          type="primary"
          onClick={handleNextWord}
          style={{ margin: "10px", fontSize: "16px" }}
        >
          Next
        </Button>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Title level={2}>Flash Card Game</Title>
        <Space
          direction="vertical"
          size="large"
          style={{ marginBottom: "20px", marginRight: "10px" }}
        >
          <Select
            style={{ width: 200 }}
            value={activeDataset}
            onChange={(value) => setActiveDataset(value)}
          >
            {Object.keys(datasets).map((datasetName) => (
              <Option key={datasetName} value={datasetName}>
                {datasetName}
              </Option>
            ))}
          </Select>
        </Space>
        {!gameStarted ? (
          <>
            <Space direction="vertical" size="large">
              <Select
                style={{ width: 200 }}
                value={wordCount}
                onChange={(value) => setWordCount(value)}
              >
                <Option value={5}>5 words</Option>
                <Option value={10}>10 words</Option>
                <Option value={15}>15 words</Option>
                <Option value={20}>20 words</Option>
              </Select>
            </Space>
            <Row justify="center">
              <Col>
                <Button type="primary" onClick={handleStartGame}>
                  Start Game
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          renderGameContent()
        )}
      </div>
    </>
  );
};

export default FlashCards;
