import React from 'react';
import PropTypes from 'prop-types';
import { each as lodashEach } from 'lodash';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { connect } from 'react-redux';
import Opacity from './opacity';
import Palette from './palette';
import VectorStyle from './vector-style';
import PaletteThreshold from './palette-threshold';
import GranuleLayerDateList from './granule-list';
import GranuleCountSlider from './granule-count';
import {
  getCheckerboard,
  palettesTranslate
} from '../../../modules/palettes/util';
import {
  getDefaultLegend,
  getCustomPalette,
  getPaletteLegends,
  getPalette,
  getPaletteLegend,
  isPaletteAllowed
} from '../../../modules/palettes/selectors';
import {
  setThresholdRangeAndSquash,
  setCustomPalette,
  clearCustomPalette
} from '../../../modules/palettes/actions';
import {
  setFilterRange,
  setStyle,
  clearStyle
} from '../../../modules/vector-styles/actions';

import {
  getVectorStyle
} from '../../../modules/vector-styles/selectors';
import {
  updateGranuleLayerDates,
  resetGranuleLayerDates,
  updateGranuleCMRGeometry,
  toggleHoveredGranule,
  setOpacity
} from '../../../modules/layers/actions';

class LayerSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0
    };
    this.canvas = document.createElement('canvas');
    this.canvas.width = 120;
    this.canvas.height = 10;
    this.checkerboard = getCheckerboard();
  }

  /**
   * Render multicolormap layers inside a tab pane
   * @param {object} paletteLegends | legend object
   */
  renderMultiColormapCustoms(paletteLegends) {
    const {
      clearCustomPalette,
      getPalette,
      paletteOrder,
      getDefaultLegend,
      getCustomPalette,
      setCustomPalette,
      palettesTranslate,
      groupName,
      setThresholdRange,
      layer
    } = this.props;
    const { activeIndex } = this.state;
    const navElements = [];
    const paneElements = [];
    lodashEach(paletteLegends, (legend, i) => {
      const activeClass = activeIndex === i ? 'active' : '';
      const dualStr = paletteLegends.length === 2 ? ' dual' : '';
      const navItemEl = (
        <NavItem
          key={legend.id + 'nav'}
          className={'settings-customs-title ' + activeClass + dualStr}
        >
          <NavLink onClick={() => this.setState({ activeIndex: i })}>
            {legend.title}
          </NavLink>
        </NavItem>
      );
      const palette = getPalette(layer.id, i);
      const max = legend.colors.length - 1;
      const start = palette.min || 0;
      const end = palette.max || max;
      let paneItemEl;
      if (
        legend.type !== 'continuous' &&
        legend.type !== 'discrete' &&
        legend.colors.length > 1
      ) {
        paneItemEl = (
          <TabPane key={legend.id + 'pane'} tabId={i}>
            No customizations available for this palette.
          </TabPane>
        );
      } else {
        paneItemEl = (
          <TabPane key={legend.id + 'pane'} tabId={i}>
            {legend.type !== 'classification' ? (
              <PaletteThreshold
                legend={legend}
                setRange={setThresholdRange}
                min={0}
                max={max}
                start={start}
                groupName={groupName}
                end={end}
                layerId={layer.id}
                squashed={!!palette.squash}
                index={i}
                palette={palette}
              />
            ) : (
              ''
            )}
            <Palette
              setCustomPalette={setCustomPalette}
              groupName={groupName}
              clearCustomPalette={clearCustomPalette}
              getDefaultLegend={getDefaultLegend}
              getCustomPalette={getCustomPalette}
              palettesTranslate={palettesTranslate}
              activePalette={palette.custom || '__default'}
              checkerboard={this.checkerboard}
              layer={layer}
              canvas={this.canvas}
              index={i}
              paletteOrder={paletteOrder}
            />
          </TabPane>
        );
      }

      paneElements.push(paneItemEl);
      navElements.push(navItemEl);
    });
    return (
      <React.Fragment>
        <Nav tabs>{navElements}</Nav>
        <TabContent activeTab={activeIndex}>{paneElements}</TabContent>
      </React.Fragment>
    );
  }

  /**
   * Render Opacity, threshold, and custom palette options
   */
  renderCustomPalettes() {
    const {
      setCustomPalette,
      clearCustomPalette,
      getDefaultLegend,
      getCustomPalette,
      palettesTranslate,
      getPaletteLegends,
      getPalette,
      getPaletteLegend,
      setThresholdRange,
      paletteOrder,
      groupName,
      layer
    } = this.props;
    const paletteLegends = getPaletteLegends(layer.id);
    if (!paletteLegends) return '';
    const len = paletteLegends.length;
    const palette = getPalette(layer.id, 0);
    const legend = getPaletteLegend(layer.id, 0);
    const max = palette.legend.colors.length - 1;
    const start = palette.min || 0;
    const end = palette.max || max;
    if (len > 1) {
      return this.renderMultiColormapCustoms(paletteLegends);
    } else if (legend.type === 'classification' && legend.colors.length > 1) {
      return '';
    }

    return (
      <React.Fragment>
        {legend.type !== 'classification' &&
          <PaletteThreshold
            legend={legend}
            setRange={setThresholdRange}
            min={0}
            max={max}
            start={start}
            layerId={layer.id}
            end={end}
            squashed={!!palette.squash}
            groupName={groupName}
            index={0}
            palette={palette}
          />
        }
        <Palette
          setCustomPalette={setCustomPalette}
          clearCustomPalette={clearCustomPalette}
          getDefaultLegend={getDefaultLegend}
          getCustomPalette={getCustomPalette}
          palettesTranslate={palettesTranslate}
          activePalette={palette.custom || '__default'}
          checkerboard={this.checkerboard}
          layer={layer}
          canvas={this.canvas}
          groupName={groupName}
          index={0}
          paletteOrder={paletteOrder}
        />
      </React.Fragment>
    );
  }

  /**
   * Render Opacity, threshold, and custom palette options
   */
  renderVectorStyles() {
    const {
      setStyle,
      clearStyle,
      groupName,
      layer,
      vectorStyles
    } = this.props;
    var customStyle;
    if (layer.custom && layer.custom[0]) {
      customStyle = layer.custom[0];
    }
    return (
      <React.Fragment>
        <VectorStyle
          setStyle={setStyle}
          clearStyle={clearStyle}
          activeVectorStyle={customStyle || layer.id}
          layer={layer}
          index={0}
          groupName={groupName}
          vectorStyles={vectorStyles}
        />
      </React.Fragment>
    );
  }

  render() {
    var renderCustomizations;
    const {
      setOpacity,
      customPalettesIsActive,
      layer,
      palettedAllowed,
      projection,
      granuleLayerCount,
      granuleLayerDates,
      granuleCMRGeometry,
      resetGranuleLayerDates,
      updateGranuleCMRGeometry,
      updateGranuleLayerDates,
      toggleHoveredGranule
    } = this.props;

    if (layer.type !== 'vector') {
      renderCustomizations =
        customPalettesIsActive && palettedAllowed && layer.palette
          ? this.renderCustomPalettes()
          : '';
    } else {
      renderCustomizations = this.renderVectorStyles();
    }

    if (!layer.id) return '';
    return (
      <React.Fragment>
        <Opacity
          start={Math.ceil(layer.opacity * 100)}
          setOpacity={setOpacity}
          layer={layer}
        />
        {granuleLayerDates
          ? <React.Fragment>
            <GranuleCountSlider
              start={granuleLayerCount}
              projection={projection}
              granuleDates={granuleLayerDates}
              granuleCount={granuleLayerCount}
              updateGranuleLayerDates={updateGranuleLayerDates}
              layer={layer}
            />
            <GranuleLayerDateList
              def={layer}
              projection={projection}
              granuleDates={granuleLayerDates}
              granuleCount={granuleLayerCount}
              updateGranuleCMRGeometry={updateGranuleCMRGeometry}
              updateGranuleLayerDates={updateGranuleLayerDates}
              resetGranuleLayerDates={resetGranuleLayerDates}
              toggleHoveredGranule={toggleHoveredGranule}
              granuleCMRGeometry={granuleCMRGeometry}
            />
          </React.Fragment> : null}
        {renderCustomizations}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { config, palettes, compare, layers, proj } = state;
  const { custom } = palettes;
  const groupName = compare.activeString;
  const projection = proj.id;

  const isGranuleLayer = layers.granuleLayers[groupName][projection][ownProps.layer.id];
  let granuleLayerDates;
  let granuleLayerCount;
  let granuleCMRGeometry;
  if (isGranuleLayer) {
    granuleLayerDates = layers.granuleLayers[groupName][projection][ownProps.layer.id].dates;
    granuleLayerCount = layers.granuleLayers[groupName][projection][ownProps.layer.id].count;
    granuleCMRGeometry = layers.granuleLayers[groupName][projection][ownProps.layer.id].geometry;
  }

  return {
    map: state.map.ui,
    projection,
    granuleLayerDates,
    granuleLayerCount: granuleLayerCount || 20,
    granuleCMRGeometry,
    paletteOrder: config.paletteOrder,
    groupName,
    customPalettesIsActive: !!config.features.customPalettes,
    palettedAllowed: isPaletteAllowed(ownProps.layer.id, config),
    palettesTranslate,
    getDefaultLegend: (layerId, index) => {
      return getDefaultLegend(layerId, index, state);
    },
    getCustomPalette: id => {
      return getCustomPalette(id, custom);
    },
    getPaletteLegend: (layerId, index) => {
      return getPaletteLegend(layerId, index, groupName, state);
    },

    getPaletteLegends: layerId => {
      return getPaletteLegends(layerId, groupName, state);
    },
    getPalette: (layerId, index) => {
      return getPalette(layerId, index, groupName, state);
    },
    getVectorStyle: (layerId, index) => {
      return getVectorStyle(layerId, index, groupName, state);
    },
    vectorStyles: config.vectorStyles
  };
}
const mapDispatchToProps = dispatch => ({
  setThresholdRange: (layerId, min, max, squash, index, groupName) => {
    dispatch(
      setThresholdRangeAndSquash(layerId, { min, max, squash }, index, groupName)
    );
  },
  setFilterRange: (layerId, min, max, index, groupName) => {
    dispatch(
      setFilterRange(layerId, { min, max }, index, groupName)
    );
  },
  setCustomPalette: (layerId, paletteId, index, groupName) => {
    dispatch(setCustomPalette(layerId, paletteId, index, groupName));
  },
  clearCustomPalette: (layerId, index, groupName) => {
    dispatch(clearCustomPalette(layerId, index, groupName));
  },
  setStyle: (layer, vectorStyleId, groupName) => {
    dispatch(setStyle(layer, vectorStyleId, groupName));
  },
  clearStyle: (layer, vectorStyleId, groupName) => {
    dispatch(clearStyle(layer, vectorStyleId, groupName));
  },
  setOpacity: (id, opacity) => {
    dispatch(setOpacity(id, opacity));
  },
  updateGranuleCMRGeometry: (id, projection, geometry) => {
    dispatch(updateGranuleCMRGeometry(id, projection, geometry));
  },
  updateGranuleLayerDates: (dates, id, projection, count) => {
    dispatch(updateGranuleLayerDates(dates, id, projection, count));
  },
  resetGranuleLayerDates: (id, projection) => {
    dispatch(resetGranuleLayerDates(id, projection));
  },
  toggleHoveredGranule: (id, projection, granuleDate) => {
    dispatch(toggleHoveredGranule(id, projection, granuleDate));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayerSettings);

LayerSettings.defaultProps = {
  isOpen: false,
  layer: { id: null, name: null },
  palettedAllowed: false,
  title: null
};
LayerSettings.propTypes = {
  canvas: PropTypes.object,
  clearCustomPalette: PropTypes.func,
  clearStyle: PropTypes.func,
  customPalettesIsActive: PropTypes.bool,
  getCustomPalette: PropTypes.func,
  getDefaultLegend: PropTypes.func,
  getPalette: PropTypes.func,
  getPaletteLegend: PropTypes.func,
  getPaletteLegends: PropTypes.func,
  getVectorStyle: PropTypes.func,
  granuleLayerCount: PropTypes.number,
  granuleLayerDates: PropTypes.array,
  groupName: PropTypes.string,
  index: PropTypes.number,
  isOpen: PropTypes.bool,
  layer: PropTypes.object,
  palettedAllowed: PropTypes.bool,
  paletteOrder: PropTypes.array,
  palettesTranslate: PropTypes.func,
  projection: PropTypes.string,
  resetGranuleLayerDates: PropTypes.func,
  setCustomPalette: PropTypes.func,
  setFilterRange: PropTypes.func,
  setOpacity: PropTypes.func,
  setStyle: PropTypes.func,
  setThresholdRange: PropTypes.func,
  title: PropTypes.string,
  toggleHoveredGranule: PropTypes.func,
  updateGranuleCMRGeometry: PropTypes.func,
  updateGranuleLayerDates: PropTypes.func,
  vectorStyles: PropTypes.object
};
