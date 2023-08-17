///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import { HomeOutlined } from 'jimu-icons/outlined/application/home';
import { WidgetBookmarkOutlined } from 'jimu-icons/outlined/brand/widget-bookmark';
import { Nav, NavItem, NavLink } from 'jimu-ui';
import React, { useContext, useState } from 'react';
import MainContext from '../../Contexts/MainContext';
import { handleGetFoldersAndFiles } from '../../Services/apiService';
import defaultMessages from "../../translations/default";
import '../NavBar/style.css';

const Navbar = ({ onMenuSelect, allWidgetProps }) => {
    const [activeTabIndex, setActiveTabIndex] = useState(1);
    const { setFolders, setFiles, featureId, setSelectedFolders, setSelectedFiles } = useContext(MainContext);

    const setActive = (index: number) => {
        setActiveTabIndex(index);
        onMenuSelect(index);
    };

    const handleGetFolders = async () => {
        handleGetFoldersAndFiles(setFolders, setFiles,
            featureId, setSelectedFolders,
            setSelectedFiles
        );
    };

    return (
        <Nav className="nav-bar-container">
            <NavItem className={"nav-btn"}>
                <NavLink
                    active={activeTabIndex === 0} onClick={async () => {
                        setActive(0);
                        await handleGetFolders();
                        setSelectedFolders([]);
                        setSelectedFiles([]);
                    }}>
                    <WidgetBookmarkOutlined size={28}></WidgetBookmarkOutlined>
                    {allWidgetProps.intl.formatMessage({ id: 'AttachedFiles', defaultMessage: defaultMessages.AttachedFiles })}
                </NavLink>
            </NavItem>
            <NavItem className={"nav-btn"}>
                <NavLink
                    active={activeTabIndex === 1} onClick={() => {
                        setActive(1);
                    }}>
                    <HomeOutlined size={28}></HomeOutlined>
                    {allWidgetProps.intl.formatMessage({ id: 'MainTab', defaultMessage: defaultMessages.MainTab })}
                </NavLink>
            </NavItem>
        </Nav>
    );
};

export default Navbar;