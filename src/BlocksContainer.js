import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {Droppable} from 'react-beautiful-dnd';
import Block from './Block';
import AddButton from './AddButton';
import {getNestedBlockDefinition, isNA} from './processing/utils';


@connect((state, props) => {
  const {fieldId, id} = props;
  const fieldData = state[fieldId];
  const blocksIds = id === null ?
    fieldData.rootBlocks
    :
    fieldData.blocks[id].value;
  let minNum, maxNum;
  if (id === null) {
    minNum = fieldData.minNum;
    maxNum = fieldData.maxNum;
  } else {
    const blockDefinition = getNestedBlockDefinition(state, fieldId, id);
    minNum = blockDefinition.minNum;
    maxNum = blockDefinition.maxNum;
  }
  if (isNA(minNum)) {
    minNum = 0;
  }
  if (isNA(maxNum)) {
    maxNum = Infinity;
  }
  return {
    minNum, maxNum,
    gutteredAdd: fieldData.gutteredAdd,
    blocksIds: blocksIds,
  };
})
class BlocksContainer extends React.Component {
  static propTypes = {
    fieldId: PropTypes.string.isRequired,
    id: PropTypes.string,
  };

  static defaultProps = {
    id: null,
  };

  renderBlock(blockId, canAdd=true) {
    return (
      <Block key={blockId}
             fieldId={this.props.fieldId}
             id={blockId} canAdd={canAdd} />
    );
  }

  render() {
    const {fieldId, id, blocksIds, maxNum, gutteredAdd} = this.props;
    const droppableId = `${fieldId}-${id}`;
    const num = blocksIds.length;
    const canAdd = num < maxNum;
    return (
      <Droppable droppableId={droppableId} type={droppableId}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef}
               className={classNames(
                 'children-container',
                 snapshot.isDraggingOver && 'is-dragging',
                 gutteredAdd && 'guttered-add')}>
            <AddButton fieldId={fieldId} parentId={id}
                       open={blocksIds.length === 0} visible={canAdd} />
            {blocksIds.map(blockId => this.renderBlock(blockId, canAdd))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }
}


export default BlocksContainer;
