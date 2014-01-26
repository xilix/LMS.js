<?php
class AllFeatures extends PHPUnit_Framewor_TestCase
{
    public function testVector()
    {
      // new vector(array(0, 1, 2)); > [0, 1, 2]
      // new vector(0, 4); > [0, 1, 2, 3, 4]
      // new vector(0, 0.5, 2); > [0, 0.5, 1, 1.5, 2];
      // $vector->transpose() > [[0, 1, 2]]
      // $vector->multiply($vector)
      // $vector->multiply(3)
      // $vector->reduce()
      // $vector->map()
    }


    public function testLms()
    {
    }

    public function testRls()
    {
    }

    public function testWienerVolterra()
    {
    }

    public function testPearsonCoef()
    {
    }

    public function testDtw()
    {
    }

    public function testHmm()
    {
    }
}
?>
