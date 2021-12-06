import React, { FC } from 'react';
import { ISignTxProps } from '../../interface';
import { WAVES } from '../../constants';
import { useTxUser } from '../../hooks/useTxUser';
import { getPrintableNumber } from '../../utils/math';
import { SignAliasComponent } from './SignAliasComponent';
import { AliasTransaction } from '@waves/ts-types';

export const SignAliasContainer: FC<ISignTxProps<AliasTransaction>> = ({
    tx,
    user,
    onConfirm,
    onCancel,
}) => {
    const { userBalance } = useTxUser(user);
    const fee = getPrintableNumber(tx.fee, WAVES.decimals);

    return (
        <SignAliasComponent
            userAddress={user.address}
            userName={user.username}
            userBalance={`${userBalance} WAVES`}
            userHasScript={user.hasScript}
            tx={tx}
            fee={`${fee} WAVES`}
            onConfirm={onConfirm}
            onReject={onCancel}
        />
    );
};
