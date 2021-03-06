import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import AnimateHeight from 'react-animate-height';
import {
  getNestedBlockDefinition,
  isStruct,
  getDescendantsIds, isSimpleLayout, replaceWithComponent, isNA,
} from './processing/utils';
import StructChildField from './StructChildField';
import FieldInput from './FieldInput';


@connect((state, props) => {
  const {fieldId, blockId} = props;
  const fieldData = state[fieldId];
  const blocks = fieldData.blocks;
  const block = blocks[blockId];
  const blockDefinition = getNestedBlockDefinition(state, fieldId, blockId);
  const hasDescendantError = getDescendantsIds(state, fieldId, blockId, true)
    .some(descendantBlockId => blocks[descendantBlockId].hasError);
  return {
    isSimpleLayout: isSimpleLayout(blockDefinition, fieldData.isMobile),
    blockDefinition,
    html: block.html,
    closed: block.closed && !hasDescendantError,
  };
})
class BlockContent extends React.Component {
  static propTypes = {
    fieldId: PropTypes.string.isRequired,
    blockId: PropTypes.string.isRequired,
    collapsible: PropTypes.bool,
  };

  static defaultProps = {
    collapsible: true,
  };

  get html() {
    const {fieldId, blockDefinition, blockId} = this.props;
    if (isStruct(blockDefinition)) {
      const blocksContainer = blockDefinition.children.map(
        childBlockDefinition =>
          <StructChildField key={childBlockDefinition.key} fieldId={fieldId}
                            parentBlockId={blockId}
                            type={childBlockDefinition.key}/>
      );
      let html = this.props.html;
      if (isNA(html)) {
        html = blockDefinition.html;
      }
      if (isNA(html)) {
        return blocksContainer;
      }
      return replaceWithComponent(
        html, '<noscript data-blocks-container></noscript>',
        blocksContainer);
    }
    return <FieldInput fieldId={fieldId} blockId={blockId} />;
  }

  get height() {
    return this.props.closed ? 0 : 'auto';
  }

  render() {
    const {isSimpleLayout, blockDefinition, collapsible} = this.props;
    const content = this.html;
    const className = classNames('content', blockDefinition.className);
    if (collapsible && !isSimpleLayout) {
      return (
        <AnimateHeight height={this.height} easing="ease-in-out"
                       className="content-container"
                       contentClassName={className}>
          {content}
        </AnimateHeight>
      );
    }
    return (
      <div className="content-container">
        <div className={className}>
          {content}
        </div>
      </div>
    );
  }
}


export default BlockContent;
