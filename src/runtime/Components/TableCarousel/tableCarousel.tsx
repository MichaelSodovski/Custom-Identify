///////////////////////////////////////////////////////////////////////////
// Copyright © 2023. All Rights Reserved to Mishka.
///////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useContext } from 'react';
import { Table } from 'jimu-ui';
import MainContext from '../../Contexts/MainContext';
import defaultMessages from "../../translations/default";
import '../TableCarousel/style.css';
import { TableCarouselProps } from '../../types/TableCarouselProps'

function TableCarousel({ queriedFeatures, handleFocusClick, featureId, ...props }: TableCarouselProps) {
    const { setFeatureId, setFeatureName } = useContext(MainContext);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const getFeatureDetails = () => {
        const feature = queriedFeatures.find((f) => {
            return f.attributes.objectid === featureId;
        });
        // set feature name.
        if (feature) {
            if (feature.attributes.port_name && feature.attributes.port_name.trim() !== "") {
                setFeatureName(feature.attributes.port_name);
            } else if (feature.attributes.brwater_na && feature.attributes.brwater_na.trim() !== "") {
                setFeatureName(feature.attributes.brwater_na);
            } else {
                const NoNameFieldToShow = props.intl.formatMessage({ id: 'NoNameFieldToShow', defaultMessage: defaultMessages.NoNameFieldToShow });
                setFeatureName(NoNameFieldToShow);
            }
        }
        // pull the index of the feature object from the queriedFeatures array.
        let index;
        if (queriedFeatures !== undefined && queriedFeatures !== null && queriedFeatures.length > 0) {
            index = queriedFeatures.findIndex((f) => f.attributes.objectid === featureId);
        }

        if (index === -1) {
            return;
        } else {
            setCurrentFeatureIndex(index);
        }

        if (feature === undefined) {
            return;
        } else {
            let objectID = feature.attributes.objectid;
            setFeatureId(objectID);
            return feature;
        }
    }

    useEffect(() => {
        const feature = getFeatureDetails();
        setCurrentFeature(feature);
    }, [queriedFeatures, featureId])

    const prevFeature = () => {
        if (currentFeatureIndex > 0 && !isNavigating) {
            setIsNavigating(true);
            const tableBody = document.querySelector(".table-body");
            tableBody.classList.add("table-body-transition");
            setTimeout(() => {
                setCurrentFeatureIndex((prev) => {
                    const newIndex = prev - 1;
                    const prevFeatureId = queriedFeatures[newIndex].attributes.objectid;
                    setFeatureId(prevFeatureId);
                    tableBody.classList.remove("table-body-transition");
                    setIsNavigating(false);
                    return newIndex;
                });
            }, 200);
        }
    };

    const nextFeature = () => {
        if (currentFeatureIndex < queriedFeatures.length - 1 && !isNavigating) {
            setIsNavigating(true);
            const tableBody = document.querySelector(".table-body");
            tableBody.classList.add("table-body-transition");
            setTimeout(() => {
                setCurrentFeatureIndex((prev) => {
                    const newIndex = prev + 1;
                    const nextFeatureId = queriedFeatures[newIndex].attributes.objectid;
                    setFeatureId(nextFeatureId);
                    tableBody.classList.remove("table-body-transition");
                    setIsNavigating(false);
                    return newIndex;
                });
            }, 200);
        }
    };


    return (
        <React.Fragment>
            {currentFeature && queriedFeatures.length > 0 && (
                <>
                    <div className="table-wrapper">
                        <div className="table-container">
                            <Table className="esri-widget__table">
                                <div className="table-body">
                                    <tbody>
                                        {Object.keys(currentFeature.attributes).map((key, index) => {
                                            return (
                                                <tr key={index + '-' + key}>
                                                    <td>{key}</td>
                                                    <td>{currentFeature.attributes[key]}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </div>
                            </Table>
                        </div>
                        <div className="footer-container">
                            <div role="button"
                                title="Zoom to"
                                className="esri-popup__button esri-popup__action"
                                onClick={handleFocusClick}>
                                <span aria-hidden="true" className="esri-popup__icon esri-icon-zoom-in-magnifying-glass"></span>
                                <span className="esri-popup__action-text"> {props.intl.formatMessage({ id: 'ZoomTo', defaultMessage: defaultMessages.ZoomTo })} </span>

                            </div>
                            <section className="esri-popup__navigation">
                                <div
                                    className="esri-popup__button esri-popup__pagination-previous"
                                    onClick={() => {
                                        prevFeature();
                                    }}>
                                    <span aria-hidden="true"
                                        className="esri-popup__icon esri-icon-left-triangle-arrow 
                                esri-popup__pagination-previous-icon"></span>
                                </div>
                                <div
                                    className="esri-popup__button esri-popup__feature-menu-button"
                                    aria-haspopup="true">
                                    {`${currentFeatureIndex + 1} of ${queriedFeatures.length}`}
                                </div>
                                <div
                                    className="esri-popup__button esri-popup__pagination-next"
                                    onClick={() => {
                                        nextFeature();
                                    }}>
                                    <span
                                        className="esri-popup__icon esri-icon-right-triangle-arrow 
                                    esri-popup__pagination-next-icon">
                                    </span>
                                </div>
                            </section>
                        </div>
                    </div>
                </>
            )}
        </React.Fragment>
    )
}

export default TableCarousel;