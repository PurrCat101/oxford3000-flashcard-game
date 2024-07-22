import React from "react";
import { Layout, Menu } from "antd";
import { HomeOutlined, CreditCardOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();

  return (
    <Header>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
        <Menu.Item key="/" icon={<HomeOutlined />}>
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/flashcards" icon={<CreditCardOutlined />}>
          <Link to="/flashcards">Flash Cards</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
};

export default Navbar;
