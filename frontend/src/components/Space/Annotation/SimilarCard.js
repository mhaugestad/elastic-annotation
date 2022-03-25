import React from 'react'
import { EuiBadge, EuiIcon, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

const SimilarCard = (props) => {
  const {documentId, setDocumentId, text} = props;

  const handleClose = () => {
    setDocumentId(()=>null)
  };

  return (
    <EuiFlexGroup wrap responsive={false} gutterSize="xs" style={{paddingTop: '20px'}}>
    <EuiFlexItem grow={false}>
    <EuiBadge
        color="hollow"
        iconType="cross"
        iconSide="right"
        iconOnClick={() => handleClose()}
        data-test-sub="testExample2"
      >
          <EuiIcon type='sortDown'/>
        <b>Most similar to:</b> {documentId}
      </EuiBadge>
    </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default SimilarCard;