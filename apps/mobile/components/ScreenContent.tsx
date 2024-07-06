import { YStack, H2, Separator, Theme, Button, Sheet, useSheet } from 'tamagui';

import { EditScreenInfo } from './EditScreenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Button theme="active" variant='outlined' className=''>er</Button>
        <H2>{title}</H2>
        <Separator />
        <EditScreenInfo path={path} />
        {children}
        <Sheet open />
      </YStack>
    </Theme>
  );
};
