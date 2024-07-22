import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import formatted_oxford_3000 from "./formatted_oxford_3000";
import {
  Table,
  Input,
  Select,
  Button,
  Modal,
  Form,
  Tag,
  Typography,
  Space,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const Oxford3000WordList = () => {
  const [datasets, setDatasets] = useState(() => {
    const savedDatasets = localStorage.getItem("wordDatasets");
    return savedDatasets
      ? JSON.parse(savedDatasets)
      : { "Oxford 3000": formatted_oxford_3000 };
  });
  const [activeDataset, setActiveDataset] = useState("Oxford 3000");
  const [words, setWords] = useState(datasets["Oxford 3000"]);
  const [filteredWords, setFilteredWords] = useState(words);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState([]);
  const [levelFilter, setLevelFilter] = useState([]);
  const [knowledgeFilter, setKnowledgeFilter] = useState([]);
  const [editWord, setEditWord] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const allTypes = Array.from(new Set(words.flatMap((word) => word.types)));
  const allLevels = Array.from(new Set(words.map((word) => word.level)));
  const allKnowledgeTags = ["Know", "Don't Know"];

  useEffect(() => {
    const results = words.filter(
      (word) =>
        word.word.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (typeFilter.length === 0 ||
          word.types.some((type) => typeFilter.includes(type))) &&
        (levelFilter.length === 0 || levelFilter.includes(word.level)) &&
        (knowledgeFilter.length === 0 ||
          knowledgeFilter.includes(word.knowledge))
    );
    setFilteredWords(results);
  }, [nameFilter, typeFilter, levelFilter, knowledgeFilter, words]);

  useEffect(() => {
    localStorage.setItem("wordDatasets", JSON.stringify(datasets));
  }, [datasets]);

  useEffect(() => {
    setWords(datasets[activeDataset]);
  }, [activeDataset, datasets]);

  const handleChangePage = (newPage) => {
    setPage(newPage - 1); // Adjusted to 0-based indexing
  };

  const handleChangeRowsPerPage = (current, size) => {
    setRowsPerPage(size);
    setPage(current - 1); // Adjusted to 0-based indexing
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
  };

  const handleLevelChange = (value) => {
    setLevelFilter(value);
  };

  const handleKnowledgeChange = (value) => {
    setKnowledgeFilter(value);
  };

  const handleEditClick = (word) => {
    setEditWord(word);
    setIsEditModalVisible(true);
  };

  const handleEditSave = () => {
    const updatedWords = words.map((w) =>
      w.id === editWord.id ? editWord : w
    );
    setWords(updatedWords);
    setDatasets({ ...datasets, [activeDataset]: updatedWords });
    setIsEditModalVisible(false);
  };

  const handleClearFilters = () => {
    setNameFilter("");
    setTypeFilter([]);
    setLevelFilter([]);
    setKnowledgeFilter([]);
  };

  const handleClearDataToDefault = () => {
    localStorage.clear();
    setDatasets({ "Oxford 3000": formatted_oxford_3000 });
    setActiveDataset("Oxford 3000");
    setWords(formatted_oxford_3000);
    setFilteredWords(formatted_oxford_3000);
    setPage(0);
    setRowsPerPage(10);
    setNameFilter("");
    setTypeFilter([]);
    setLevelFilter([]);
    setKnowledgeFilter([]);
    setEditWord(null);
    setIsEditModalVisible(false);
    message.success("Data has been reset to default.");
  };

  const handleKnowledgeUpdate = (id, value) => {
    const updatedWords = words.map((word) =>
      word.id === id ? { ...word, knowledge: value } : word
    );
    setWords(updatedWords);
    setDatasets({ ...datasets, [activeDataset]: updatedWords });
  };

  const handleImport = (info) => {
    const { status } = info.file;

    if (status === "done") {
      const file = info.file.originFileObj;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          const newDatasetName = file.name.replace(/\.[^/.]+$/, "");
          setDatasets((prevDatasets) => {
            const newDatasets = {
              ...prevDatasets,
              [newDatasetName]: importedData,
            };
            setActiveDataset(newDatasetName);
            setWords(importedData);
            return newDatasets;
          });
          message.success("Dataset imported successfully!");
        } catch (error) {
          message.error(
            "Failed to import dataset. Please ensure the file is a valid JSON."
          );
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(datasets[activeDataset]);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileName = `${activeDataset}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      render: (text, record, index) => page * rowsPerPage + index + 1,
    },
    {
      title: "Word",
      dataIndex: "word",
      key: "word",
    },
    {
      title: "Type",
      dataIndex: "types",
      key: "types",
      render: (types) => (
        <>
          {types.map((type, i) => (
            <Tag key={i}>{type}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Translation (Thai)",
      dataIndex: "translation",
      key: "translation",
    },
    {
      title: "Example",
      dataIndex: "example",
      key: "example",
    },
    {
      title: "Knowledge",
      dataIndex: "knowledge",
      key: "knowledge",
      render: (knowledge, record) => (
        <Select
          value={knowledge}
          onChange={(value) => handleKnowledgeUpdate(record.id, value)}
          style={{ width: 120 }}
        >
          {allKnowledgeTags.map((tag) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button onClick={() => handleEditClick(record)}>Edit</Button>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Title level={4}>Word List: {activeDataset}</Title>
        <Space wrap style={{ marginBottom: "20px" }}>
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
          <Upload
            accept=".json"
            // beforeUpload={() => false}
            onChange={handleImport}
            customRequest={({ onSuccess }) =>
              setTimeout(() => onSuccess("ok"), 0)
            }
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Import Dataset</Button>
          </Upload>
          <Button style={{ marginRight: "10px" }} onClick={handleExport}>
            Export Dataset
          </Button>
        </Space>
        <Space wrap style={{ marginBottom: "20px" }}>
          <Input
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <Select
            mode="multiple"
            placeholder="Select types"
            value={typeFilter}
            onChange={handleTypeChange}
            style={{ width: 200 }}
          >
            {allTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            placeholder="Select levels"
            value={levelFilter}
            onChange={handleLevelChange}
            style={{ width: 200 }}
          >
            {allLevels.map((level) => (
              <Option key={level} value={level}>
                {level}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            placeholder="Select knowledge"
            value={knowledgeFilter}
            onChange={handleKnowledgeChange}
            style={{ width: 200 }}
          >
            {allKnowledgeTags.map((tag) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
          <Button onClick={handleClearFilters}>Clear Filters</Button>
          <Button onClick={handleClearDataToDefault}>Clear Data</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={filteredWords}
          pagination={{
            current: page + 1,
            pageSize: rowsPerPage,
            onChange: handleChangePage,
            onShowSizeChange: handleChangeRowsPerPage,
          }}
          rowKey="id"
        />
        <Modal
          title="Edit Word"
          visible={isEditModalVisible}
          onOk={handleEditSave}
          onCancel={() => setIsEditModalVisible(false)}
        >
          <Form layout="vertical">
            <Form.Item label="Translation">
              <Input
                value={editWord?.translation || ""}
                onChange={(e) =>
                  setEditWord({ ...editWord, translation: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Example">
              <TextArea
                value={editWord?.example || ""}
                onChange={(e) =>
                  setEditWord({ ...editWord, example: e.target.value })
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Oxford3000WordList;
