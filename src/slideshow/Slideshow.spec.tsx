import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Slideshow } from './Slideshow';

const fireWheelLeft = () => {
  fireEvent(window, new WheelEvent('mousewheel', { detail: 2 } as any));
};

const fireWheelRight = () => {
  fireEvent(window, new WheelEvent('mousewheel', { detail: -2 } as any));
};

const clickButton = (button: HTMLElement) => {
  button.click();
};

const fireKeyDownLeft = () => fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft', which: '37' });

const fireKeyDownRight = () =>
  fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight', which: '39' });

const renderWrapper = (props?: any) => {
  const defaultProps = {
    transitionTime: 50,
    initialIndex: 1,
    backgroundItems: ['#b3ff2a', '#f4123c', '#0627f4'],
  };

  return render(<Slideshow {...defaultProps} {...props} />);
};

jest.useFakeTimers();

const getSlidesContainer = (container: HTMLElement) => container.getElementsByClassName('wrapper');

describe('Slideshow tests', () => {
  describe('Button click', () => {
    test('should have next key click next', () => {
      const { container, getByText } = renderWrapper();

      clickButton(getByText(/next/i));

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });

    test('should have key previous key when click prev', () => {
      const { container, getByText } = renderWrapper();

      clickButton(getByText(/prev/i));

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });

    test('should not change key when we are at the start and click prev', async () => {
      const { container, getByText } = renderWrapper({ initialIndex: 0 });

      clickButton(getByText(/prev/i));

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });

    test('should not change key when we are at the end and click next', async () => {
      const { container, getByText } = renderWrapper();

      clickButton(getByText(/next/i));

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });

    test('should not change key twice when clicking twice without waiting transition time', () => {
      const { container, getByText } = renderWrapper({ initialIndex: 2, transitionTime: 10000 });
      const prevButton = getByText(/prev/i);

      clickButton(prevButton);

      let currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);

      clickButton(prevButton);

      currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);
    });

    test('should change key twice when clicking twice waiting transition time', () => {
      const { container, getByText } = renderWrapper({ initialIndex: 0, transitionTime: 10000 });
      const nextButton = getByText(/next/i);

      clickButton(nextButton);

      let currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);

      jest.runOnlyPendingTimers();
      clickButton(nextButton);

      currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });
  });

  describe('Keyboard press', () => {
    test('should have previous key when press left key', () => {
      const { container } = renderWrapper();

      fireKeyDownLeft();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });

    test('should have next key press right key', () => {
      const { container } = renderWrapper();

      fireKeyDownRight();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });

    test('should not change key when we are at the start and press left', async () => {
      const { container } = renderWrapper({ initialIndex: 0 });

      fireKeyDownLeft();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });

    test('should not change key when we are at the end and press right', async () => {
      const { container } = renderWrapper({ initialIndex: 2 });

      fireKeyDownRight();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });

    test('should not change key twice when pressing key twice without waiting transition time', () => {
      const { container } = renderWrapper({ initialIndex: 0, transitionTime: 10000 });

      fireKeyDownRight();

      let currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);

      fireKeyDownRight();

      currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);
    });

    test('should change key twice when pressing key twice waiting transition time', () => {
      const { container } = renderWrapper({ initialIndex: 2, transitionTime: 10000 });

      fireKeyDownLeft();

      let currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);

      jest.runOnlyPendingTimers();
      fireKeyDownLeft();

      currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });
  });

  describe('Scroll wheel', () => {
    test('should have key 0 when starts with index 1 and mouse wheel right', () => {
      const { container } = renderWrapper();

      fireWheelRight();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });

    test('should have key 2 when starts with index 1 and mouse wheel right', () => {
      const { container } = renderWrapper();

      fireWheelLeft();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });

    test('should have key 0 when have index 0 and wheel right', async () => {
      const { container } = renderWrapper({ initialIndex: 0 });

      fireWheelRight();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });

    test('should have key 2 when have index 2 and wheel left', async () => {
      const { container } = renderWrapper();

      fireWheelLeft();

      const currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-200vw)`);
    });

    test('should not change key twice when wheeling twice without waiting transition time', () => {
      const { container } = renderWrapper({ initialIndex: 0, transitionTime: 10000 });

      fireWheelLeft();

      let currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);

      fireWheelLeft();

      currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);
    });

    test('should change key twice when wheeling twice waiting transition time', () => {
      const { container } = renderWrapper({ initialIndex: 2, transitionTime: 10000 });

      fireWheelRight();

      let currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(-100vw)`);

      jest.runOnlyPendingTimers();
      fireWheelRight();

      currentItem = getSlidesContainer(container);
      expect(currentItem[0]).toHaveStyle(`transform: translateX(0vw)`);
    });
  });
});
